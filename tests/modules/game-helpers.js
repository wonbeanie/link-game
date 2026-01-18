import { fireEvent, screen, waitFor, within } from '@testing-library/dom';
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

export async function setupHTMLInit(){
  const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), 'utf8');;
  window.history.pushState({}, '', '?admin=true');
  document.body.innerHTML = html.toString();
  jest.resetModules();
  await import("../../game.js");
}


export async function setupVoting() {
  let result = {};
  result[`SuspectList-${userNickname}`] = userNickname;
  result[`SuspectList-${nickname}`] = userNickname;

  mockDatabaseUpdate(result, false, true);

  const activityLog = screen.getByText(/활동 로그/);
  const logDisplay = activityLog.nextElementSibling;

  expect(logDisplay).toHaveAttribute('id', 'display');

  const { findAllByText } = within(logDisplay);
  const nicknameLog = await findAllByText(nickname);
  expect(nicknameLog).toHaveLength(2);

  const votingLog = await findAllByText(`${userNickname}님을 투표하였습니다.`);
  expect(votingLog).toHaveLength(2);
}

export const hintWord = "힌트 단어";