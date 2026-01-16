import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { gameDataTable, mockDatabaseUpdate, nickname, setPlayers, testInit, userNickname } from "../__mocks__/mock-firebase-database";
import fs from 'fs';
import path from 'path';

export async function setupGameStart(){
  setPlayers([userNickname]);

  const nicknameInput = screen.getByPlaceholderText('닉네임을 입력하세요');
  fireEvent.change(nicknameInput, {target : {value : nickname}});

  const confirmButton = screen.getByText("입력 완료");
  confirmButton.click();

  testInit({Sequence : true});

  const gameStartBtn = screen.getByText("게임 시작하기");
  gameStartBtn.click();

  await screen.findByText(/게임시작|당신 순서입니다./);
}

export async function setupSendHint(){
  const hintInput = screen.getByPlaceholderText('힌트 단어를 입력하세요');
  fireEvent.change(hintInput, {target : {value : hintWord}});

  const hintBtn = screen.getByText("힌트 제출");
  hintBtn.click();

  let result = {};

  result[userNickname] = hintWord;
  result["Sequence"] = "end";

  mockDatabaseUpdate(result, false, true);

  await waitFor(()=>{
    const votingAlert = screen.getByRole('heading', { 
      level: 3, 
      name: /토론시간/ 
    });

    expect(votingAlert).toBeVisible();
  }, {timeout: 1000});
}

export function setupHTMLInit(){
  const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), 'utf8');;
  window.history.pushState({}, '', '?admin=true');
  document.body.innerHTML = html.toString();
  jest.resetModules();
  import("../../game.js");
}

export const hintWord = "힌트 단어";