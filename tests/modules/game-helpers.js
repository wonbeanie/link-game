import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { mockDatabaseUpdate, nickname, setPlayers, testInit, userNickname } from "../__mocks__/mock-firebase-database";
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

  await checkAlert("토론시간");
}

export async function setupHTMLInit(){
  const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), 'utf8');;
  window.history.pushState({}, '', '?admin=true');
  document.body.innerHTML = html.toString();
  jest.resetModules();
  await import("../../game.js");
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