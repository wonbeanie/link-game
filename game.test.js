/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor, within } from '@testing-library/dom';
import '@testing-library/jest-dom';

import fs from 'fs';
import path from 'path';
import { anotherUserUpdateDatabase, setPlayers, testInit } from './__mocks__/mock-firebase-database.js';

jest.mock('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js');
jest.mock("https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js");

describe('테스트', () => {
  const html = fs.readFileSync(path.resolve(__dirname, "./index.html"), 'utf8');
  const userNickname = "유저";
  const nickname = "방장";
  const gameDataTable = "GameData/";
  let initDatabase = {};
  
  beforeEach(()=> {
    window.history.pushState({}, '', '?admin=true');
    document.body.innerHTML = html.toString();
    jest.resetModules();
    import("./game.js");

    initDatabase = {};
    initDatabase[gameDataTable] = {};
    anotherUserUpdateDatabase(initDatabase);
  });

  test("게임 시작과 초기화 버튼 확인", () => {
    const gameStartBtn = screen.getByText("게임 시작하기");
    const databaseInitBtn = screen.getByText("초기화");

    expect(gameStartBtn).toBeVisible();
    expect(databaseInitBtn).toBeVisible();
  });

  test("1명의 유저가 존재할때 닉네임 설정 확인", async () => {
    initDatabase[gameDataTable][userNickname] = "Ready";
    anotherUserUpdateDatabase(initDatabase);

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
    setPlayers([userNickname, nickname]);
    anotherUserUpdateDatabase(initDatabase);

    const gameStartBtn = screen.getByText("게임 시작하기");
    gameStartBtn.click();

    await waitFor(()=>{
      const gameStartAlert = screen.getByRole('heading', { 
        level: 3, 
        name: /게임시작|당신 순서입니다./ 
      });

      expect(gameStartAlert).toBeVisible();
    }, {timeout: 1000});
  });

  describe("게임 흐름 테스트",() => {
    beforeEach(async ()=>{
      setPlayers([userNickname, nickname]);
      testInit({Sequence : true});

      const gameStartBtn = screen.getByText("게임 시작하기");
      gameStartBtn.click();

      await waitFor(()=>{
        const gameStartAlert = screen.getByRole('heading', { 
          level: 3, 
          name: /당신 순서입니다./ 
        });

        expect(gameStartAlert).toBeVisible();
      }, {timeout: 1000});
    });

    test("힌트 입력", async () => {
      const hintWord = "힌트 단어";
      const hintInput = screen.getByPlaceholderText('힌트 단어를 입력하세요');
      fireEvent.change(hintInput, {target : {value : hintWord}});

      expect(hintInput).toBeVisible();
      expect(hintInput.value).toBe(hintWord);

      const gameState = screen.getByRole('heading', { 
        level: 2, 
        name: /님이 입력하고 있습니다./ 
      });

      expect(gameState.textContent).toBe(`${nickname}님이 입력하고 있습니다.`);

      const hintBtn = screen.getByText("힌트 제출");
      hintBtn.click();

      await waitFor(()=>{
        const gameState = screen.getByRole('heading', { 
          level: 2, 
          name: /님이 입력하고 있습니다./ 
        });

        expect(gameState.textContent).toBe(`${userNickname}님이 입력하고 있습니다.`);
      }, {timeout: 1000});

      const logDisplay = document.getElementById("display");
      const {getByText} = within(logDisplay);
      const nicknameLog = getByText(nickname);
      const hintLog = getByText(hintWord);

      expect(hintLog).toBeVisible();
      expect(nicknameLog).toBeVisible();
    });
  });
});