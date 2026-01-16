import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { mockDatabaseUpdate, nickname, setPlayers, testInit, userNickname } from "../__mocks__/mock-firebase-database";

export function setupGameStart(){
  setPlayers([userNickname, nickname]);
  testInit({Sequence : true});

  const gameStartBtn = screen.getByText("게임 시작하기");
  gameStartBtn.click();
}

export function setupSendHint(){
  const hintInput = screen.getByPlaceholderText('힌트 단어를 입력하세요');
  fireEvent.change(hintInput, {target : {value : hintWord}});

  const hintBtn = screen.getByText("힌트 제출");
  hintBtn.click();

  let result = {};

  result[userNickname] = hintWord;
  result["Sequence"] = "end";

  mockDatabaseUpdate(result, false, true);
}

export const hintWord = "힌트 단어";