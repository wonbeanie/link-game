import { fireEvent, screen, waitFor, within } from "@testing-library/dom";
import { checkAlert, hintWord, setupGameStart, setupHTMLInit } from "./modules/game-helpers";
import { nickname, userNickname } from "./__mocks__/mock-firebase-database";

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
    hintBtn.click();

    await checkAlert(`${userNickname}님이 입력하고 있습니다.`, 2);

    const logDisplay = document.getElementById("display");
    const {getByText} = within(logDisplay);
    const nicknameLog = getByText(nickname);
    const hintLog = getByText(hintWord);

    expect(hintLog).toBeVisible();
    expect(nicknameLog).toBeVisible();
  });
})