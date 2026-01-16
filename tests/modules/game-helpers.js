import { screen } from '@testing-library/dom';
import { nickname, setPlayers, testInit, userNickname } from "../__mocks__/mock-firebase-database";

export function setupGameStart(){
  setPlayers([userNickname, nickname]);
  testInit({Sequence : true});

  const gameStartBtn = screen.getByText("게임 시작하기");
  gameStartBtn.click();
}