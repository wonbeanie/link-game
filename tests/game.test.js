/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { checkAlert, setupAdmin, setupHTMLInit } from './lib/game-helpers.js';
import { getDatabase, mockLightDBUpdate, setPlayers } from './lib/database-helpers.js';
import { nickname, userNickname } from './__mocks__/mock-lightdb.js';
import { DATABASE_KEYS, TABLE_KEYS, WATTING_ROOM_STATE } from '../src/lib/modules.js';

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

  test("참가자가 방 ID로 입장하면 대기 플레이어로 등록된다", async () => {
    await setupHTMLInit();
    await mockLightDBUpdate({
      [DATABASE_KEYS.GAME_DATA_KEY]: {}
    });

    const lightDB = await getDatabase();
    const roomId = "TEST-LIGHTDB-ROOM-ID";
    const roomDatabase = {
      [DATABASE_KEYS.GAME_DATA_KEY]: {
        [nickname]: WATTING_ROOM_STATE.READY
      }
    };
    const joinRoomSpy = jest.spyOn(lightDB, "joinRoom").mockImplementationOnce(async () => {
      lightDB.database = roomDatabase;
      return roomDatabase;
    });

    const nicknameInput = screen.getByPlaceholderText("닉네임을 입력하세요");
    fireEvent.change(nicknameInput, {target: {value: userNickname}});
    fireEvent.click(nicknameInput.nextElementSibling);

    const roomIdInput = screen.getByPlaceholderText("방장의 ID를 입력하세요");
    fireEvent.change(roomIdInput, {target: {value: roomId}});

    const connectBtn = screen.getByRole("button", {name: "연결하기"});
    fireEvent.click(connectBtn);

    await waitFor(() => {
      expect(joinRoomSpy).toHaveBeenCalledWith(roomId, {
        resetStorage: true
      });
    });

    await waitFor(() => {
      expect(lightDB.database[DATABASE_KEYS.GAME_DATA_KEY]).toMatchObject({
        [nickname]: WATTING_ROOM_STATE.READY,
        [userNickname]: WATTING_ROOM_STATE.STANDBY
      });
    });
    expect(roomIdInput).toHaveValue("");
    expect(document.getElementById("admin-btn")).toHaveClass("none");
    expect(screen.getByRole("button", {name: "준비 완료"})).toBeVisible();

    joinRoomSpy.mockRestore();
  });

  test("게임 시작 팝업 확인", async () => {
    await setPlayers([userNickname, nickname]);

    const adminModalOpenBtn = screen.getByText(/방장 컨트롤 패널 열기/);
    fireEvent.click(adminModalOpenBtn);

    const gameStartBtn = screen.getByText(/게임 시작하기/);
    fireEvent.click(gameStartBtn);

    await checkAlert("게임시작|당신 순서입니다.");

    const lightDB = await getDatabase();

    await waitFor(() => {
      const gameData = lightDB.database[DATABASE_KEYS.GAME_DATA_KEY];

      expect(gameData[TABLE_KEYS.SEQUENCE]).toEqual(expect.arrayContaining([nickname, userNickname]));
      expect(gameData[TABLE_KEYS.SUSPECT]).toEqual(expect.any(String));
      expect(gameData[TABLE_KEYS.CATEGORY]).toEqual(expect.any(String));
      expect(gameData[TABLE_KEYS.CORRECT]).toEqual(expect.any(String));
      expect(gameData[TABLE_KEYS.FAKE_CORRECT]).toEqual(expect.any(String));
      expect(gameData[TABLE_KEYS.START]).toBeUndefined();
    });
  });

  test("준비하지 않은 플레이어가 있으면 게임 시작을 막는다", async () => {
    await mockLightDBUpdate({
      [nickname]: WATTING_ROOM_STATE.READY,
      [userNickname]: WATTING_ROOM_STATE.STANDBY
    }, false, true);

    const adminModalOpenBtn = screen.getByText(/방장 컨트롤 패널 열기/);
    fireEvent.click(adminModalOpenBtn);

    const gameStartBtn = screen.getByText(/게임 시작하기/);
    fireEvent.click(gameStartBtn);

    await screen.findByText(/준비 완료를 하지 않았습니다/);

    const lightDB = await getDatabase();
    const gameData = lightDB.database[DATABASE_KEYS.GAME_DATA_KEY];

    expect(gameData[TABLE_KEYS.START]).toBeUndefined();
    expect(gameData[TABLE_KEYS.SEQUENCE]).toBeUndefined();
  });
});
