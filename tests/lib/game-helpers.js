import { fireEvent, screen, waitFor } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';
import { DATABASE_KEYS, SEQUENCE_END, TABLE_KEYS } from '../../src/lib/modules.js';
import { setPlayers, mockDatabaseUpdate, getPlayers, getDatabase } from './database-helpers.js';
import { nickname, userNickname } from '../__mocks__/mock-peerjs.js';

export async function setupGameStart(initUsers = [userNickname]){
  const gameDatabase = await getDatabase();
  await setupAdmin();
  await setPlayers(initUsers);

  const nicknameInput = screen.getByPlaceholderText('닉네임을 입력하세요');
  fireEvent.change(nicknameInput, {target : {value : nickname}});

  const confirmButton = nicknameInput.nextElementSibling;
  confirmButton.click();

  const adminModalOpenBtn = screen.getByText(/방장 컨트롤 패널 열기/);
  adminModalOpenBtn.click();

  const gameStartBtn = screen.getByText(/게임 시작하기/);

  const update = gameDatabase.update.bind(gameDatabase);
  const spy = jest.spyOn(gameDatabase, 'update').mockImplementation((table = DATABASE_KEYS.GAME_DATA_KEY, data) => {
    const modifiedData = data && table === DATABASE_KEYS.GAME_DATA_KEY && TABLE_KEYS.START in data
      ? {
          ...data,
          [TABLE_KEYS.SEQUENCE] : [nickname, ...getPlayers()]
        }
      : data;

    return update(table, modifiedData);
  });

  gameStartBtn.click();

  await screen.findByText(/게임시작|당신 순서입니다./);

  spy.mockRestore();
}

export function setupNikcname(){
  const nicknameInput = screen.getByPlaceholderText('닉네임을 입력하세요');
  fireEvent.change(nicknameInput, {target : {value : nickname}});

  const confirmButton = nicknameInput.nextElementSibling;
  confirmButton.click();
}

export async function setupAdmin(){
  setupNikcname();
  const adminModalOpenBtn = screen.getByText(/방장 컨트롤 패널 열기/);
  adminModalOpenBtn.click();

  const createRoomBtn = screen.getByText(/방 만들기/);
  createRoomBtn.click();

  const lightDB = await getDatabase();
  await waitFor(() => {
    expect(lightDB.database[DATABASE_KEYS.GAME_DATA_KEY]).toMatchObject({
      [nickname]: expect.any(String)
    });
  });

  const adminModalExitBtn = screen.getByText("×");
  adminModalExitBtn.click();
}



export async function setupSendHint(){
  const hintInput = screen.getByPlaceholderText('힌트 단어를 입력하세요');
  fireEvent.change(hintInput, {target : {value : hintWord}});

  const hintBtn = screen.getByText("힌트 제출");
  hintBtn.click();

  let result = {
    [TABLE_KEYS.SEQUENCE] : SEQUENCE_END,
    [TABLE_KEYS.HINT_LIST] : {
      [userNickname] : hintWord
    }
  };

  await mockDatabaseUpdate(result, false, true);

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
