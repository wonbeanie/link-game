/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { checkAlert, setupHTMLInit } from './modules/game-helpers.js';
import { mockDatabaseUpdate, setPlayers } from './modules/database-helpers.js';
import { gameDataTable, nickname, userNickname } from './__mocks__/mock-peerjs.js';

describe('테스트', () => {
  let initDatabase = {};

  beforeEach(async ()=> {
    await setupHTMLInit();

    initDatabase = {};
    initDatabase[gameDataTable] = {};
    mockDatabaseUpdate(initDatabase);
  });

  test("게임 시작과 초기화 버튼 확인", () => {
    const gameStartBtn = screen.getByText("게임 시작하기");
    const databaseInitBtn = screen.getByText("초기화");

    expect(gameStartBtn).toBeVisible();
    expect(databaseInitBtn).toBeVisible();
  });

  test("1명의 유저가 존재할때 닉네임 설정 확인", async () => {
    initDatabase[gameDataTable][userNickname] = "Ready";
    await mockDatabaseUpdate(initDatabase);

    const nicknameInput = screen.getByPlaceholderText('닉네임을 입력하세요');
    fireEvent.change(nicknameInput, {target : {value : nickname}});

    const confirmButton = screen.getByText("입력 완료");
    confirmButton.click();

    const items = await screen.findAllByText(nickname);
    expect(items).toHaveLength(2);

    const userItems = await screen.findAllByText(userNickname);
    expect(userItems).toHaveLength(1);

    const readyItems = await screen.findAllByText("Ready");
    expect(readyItems).toHaveLength(2);
  });

  test("게임 시작 팝업 확인", async () => {
    await setPlayers([userNickname, nickname]);

    const adminModalOpenBtn = screen.getByText(/방장 컨트롤 패널 열기/);
    adminModalOpenBtn.click();

    const gameStartBtn = screen.getByText(/게임 시작하기/);
    gameStartBtn.click();

    await checkAlert("게임시작|당신 순서입니다.");
  });
});