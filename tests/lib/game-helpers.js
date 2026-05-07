import { fireEvent, screen, waitFor } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';
import { DATABASE_KEYS, SEQUENCE_END, TABLE_KEYS } from '../../src/lib/modules.js';
import { setPlayers, mockLightDBUpdate, getPlayers, getDatabase } from './database-helpers.js';
import { nickname, userNickname } from '../__mocks__/mock-peerjs.js';

export async function setupGameStart(initUsers = [userNickname]){
  await setupAdmin();
  await setPlayers(initUsers);

  const nicknameInput = screen.getByPlaceholderText('닉네임을 입력하세요');
  fireEvent.change(nicknameInput, {target : {value : nickname}});

  const confirmButton = nicknameInput.nextElementSibling;
  fireEvent.click(confirmButton);

  const adminModalOpenBtn = screen.getByText(/방장 컨트롤 패널 열기/);
  fireEvent.click(adminModalOpenBtn);

  const gameStartBtn = screen.getByText(/게임 시작하기/);
  const gameSetupService = (await import('../../src/service/game-setup-service.js')).default;
  const eventBus = (await import('../../src/lib/event-bus.js')).default;
  const { GameEvents } = await import('../../src/lib/events.js');

  const spy = jest.spyOn(gameSetupService, 'createDefaultData').mockImplementation(() => {
    const defaultData = {
      [TABLE_KEYS.SEQUENCE] : [nickname, ...getPlayers()],
      [TABLE_KEYS.SUSPECT] : userNickname,
      [TABLE_KEYS.CATEGORY] : "테스트",
      [TABLE_KEYS.CORRECT] : "정답",
      [TABLE_KEYS.FAKE_CORRECT] : "가짜 정답"
    };

    eventBus.emit(GameEvents.GAME_INFOS_UPDATE, defaultData);

    return defaultData;
  });

  fireEvent.click(gameStartBtn);

  await screen.findByText(/게임시작|당신 순서입니다./);

  spy.mockRestore();
}

export function setupNikcname(){
  const nicknameInput = screen.getByPlaceholderText('닉네임을 입력하세요');
  fireEvent.change(nicknameInput, {target : {value : nickname}});

  const confirmButton = nicknameInput.nextElementSibling;
  fireEvent.click(confirmButton);
}

export async function setupAdmin(){
  setupNikcname();
  const adminModalOpenBtn = screen.getByText(/방장 컨트롤 패널 열기/);
  fireEvent.click(adminModalOpenBtn);

  const createRoomBtn = screen.getByText(/방 만들기/);
  fireEvent.click(createRoomBtn);

  const lightDB = await getDatabase();
  await waitFor(() => {
    expect(lightDB.database[DATABASE_KEYS.GAME_DATA_KEY]).toMatchObject({
      [nickname]: expect.any(String)
    });
  });

  const adminModalExitBtn = screen.getByText("×");
  fireEvent.click(adminModalExitBtn);
}



export async function setupSendHint(){
  const hintInput = screen.getByPlaceholderText('힌트 단어를 입력하세요');
  fireEvent.change(hintInput, {target : {value : hintWord}});

  const hintBtn = screen.getByText("힌트 제출");
  fireEvent.click(hintBtn);

  const result = {
    [TABLE_KEYS.SEQUENCE] : SEQUENCE_END,
    [TABLE_KEYS.HINT_LIST] : {
      [userNickname] : hintWord
    }
  };

  await mockLightDBUpdate(result, false, true);
  const lightDB = await getDatabase();
  await waitFor(() => {
    expect(lightDB.database[DATABASE_KEYS.GAME_DATA_KEY]).toMatchObject({
      [TABLE_KEYS.HINT_LIST] : result[TABLE_KEYS.HINT_LIST]
    });
  });

  await checkAlert("토론시간");
}

export async function setupHTMLInit(){
  const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), 'utf8');
  document.body.innerHTML = html.toString();
  jest.resetModules();
  await import("../../src/bootstrap.js");
}

export async function checkAlert(alertTitle = "", level = 3){
  const regx = new RegExp(alertTitle);

  await waitFor(()=>{
    const alert = screen.getByRole('heading', { 
      level: level, 
      name: regx
    });

    expect(alert).toBeVisible();
  }, {timeout : 5000});
}

export const hintWord = "힌트 단어";
