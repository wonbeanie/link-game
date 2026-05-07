import { fireEvent, screen, within } from "@testing-library/dom";
import { checkAlert, hintWord, setupGameStart, setupHTMLInit } from "./lib/game-helpers";
import { getDatabase } from "./lib/database-helpers";
import { nickname, userNickname } from "./__mocks__/mock-peerjs";
import { DATABASE_KEYS, TABLE_KEYS } from "../src/lib/modules";

describe("힌트 입력 테스트", () => {
  beforeEach(async ()=>{
    await setupHTMLInit();
    await setupGameStart();
  });

  test("정상적인 힌트 입력", async () => {
    const hintInput = screen.getByPlaceholderText('힌트 단어를 입력하세요');
    fireEvent.change(hintInput, {target : {value : hintWord}});

    expect(hintInput).toBeVisible();
    expect(hintInput.value).toBe(hintWord);

    await checkAlert(`${nickname}님이 입력하고 있습니다.`, 2);

    const hintBtn = screen.getByText("힌트 제출");
    fireEvent.click(hintBtn);

    const lightDB = await getDatabase();
    expect(lightDB.database[DATABASE_KEYS.GAME_DATA_KEY][TABLE_KEYS.HINT_LIST]).toMatchObject({
      [nickname]: hintWord
    });

    await checkAlert(`${userNickname}님이 입력하고 있습니다.`, 2);

    const logDisplay = document.getElementById("log-display");
    const {findByText} = within(logDisplay);
    const nicknameLog = await findByText(nickname);
    const hintLog = await findByText(hintWord);

    expect(hintLog).toBeVisible();
    expect(nicknameLog).toBeVisible();
  });
})
