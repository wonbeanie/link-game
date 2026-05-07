/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom';
import { checkAlert, setupAdmin, setupHTMLInit } from './lib/game-helpers.js';
import { mockLightDBUpdate, setPlayers } from './lib/database-helpers.js';
import { nickname, userNickname } from './__mocks__/mock-peerjs.js';
import { DATABASE_KEYS, WATTING_ROOM_STATE } from '../src/lib/modules.js';

describe('테스트', () => {
  let initDatabase = {};

  beforeEach(async ()=> {
    await setupHTMLInit();

    initDatabase = {};
    initDatabase[DATABASE_KEYS.GAME_DATA_KEY] = {};
    await mockLightDBUpdate(initDatabase);

    await setupAdmin();
  });

  test("게임 시작과 초기화 버튼 확인", () => {
    const gameStartBtn = screen.getByText("게임 시작하기");
    const databaseInitBtn = screen.getByText("초기화");

    expect(gameStartBtn).toBeVisible();
    expect(databaseInitBtn).toBeVisible();
  });

  test("1명의 유저가 존재할때 닉네임 설정 확인", async () => {
    const newPlayer = {[userNickname] :WATTING_ROOM_STATE.STANDBY};
    await mockLightDBUpdate(newPlayer, false, true);

    const items = await screen.findAllByText(nickname);
    expect(items).toHaveLength(2);

    const userItems = await screen.findAllByText(userNickname);
    expect(userItems).toHaveLength(1);

    const readyItems = await screen.findAllByText(WATTING_ROOM_STATE.STANDBY);
    expect(readyItems).toHaveLength(2);
  });

  test("게임 시작 팝업 확인", async () => {
    await setPlayers([userNickname, nickname]);

    const adminModalOpenBtn = screen.getByText(/방장 컨트롤 패널 열기/);
    fireEvent.click(adminModalOpenBtn);

    const gameStartBtn = screen.getByText(/게임 시작하기/);
    fireEvent.click(gameStartBtn);

    await checkAlert("게임시작|당신 순서입니다.");
  });
});
