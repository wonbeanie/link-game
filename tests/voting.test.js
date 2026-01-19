import { fireEvent, screen, waitFor, within } from "@testing-library/dom";
import { setupGameStart, setupHTMLInit, setupSendHint } from "./modules/game-helpers";
import { nickname, userNickname } from "./__mocks__/mock-firebase-database";
import { setupVoting, setupVotingSetting } from "./modules/vote-helpers";

describe("투표 테스트", () => {
  beforeEach(async ()=>{
    jest.useFakeTimers();
    await setupHTMLInit();
    await setupGameStart();
    await setupSendHint();
  });

  afterEach(() => {
    jest.useRealTimers();
  })

  test("정상적인 플레이어 투표", async () => {
    screen.getByText(/범인 지목 투표/);

    const suspectSelectLabel = screen.getByText(/범인 지목 투표/);

    const votingSelect = suspectSelectLabel.nextElementSibling;

    expect(votingSelect).toHaveAttribute("id", "player-select");
    expect(votingSelect.selectedOptions[0].textContent).toBe(nickname);
    expect(votingSelect.selectedOptions[0].selected).toBe(true);
    expect(votingSelect.selectedOptions[0]).toBeVisible();

    fireEvent.change(votingSelect, {
      target : { value: userNickname }
    });

    const votingSelectOption = screen.getByRole('option', {
      name : userNickname
    });

    expect(votingSelectOption.selected).toBe(true);

    const votingBtn = screen.getByText("투표 완료");

    votingBtn.click();

    const activityLog = screen.getByText(/활동 로그/);
    const logDisplay = activityLog.nextElementSibling;

    expect(logDisplay).toHaveAttribute('id', 'display');

    const { findByText, findAllByText } = within(logDisplay);
    const nicknameLog = await findAllByText(nickname);
    expect(nicknameLog).toHaveLength(2);

    const votingLog = await findByText(`${userNickname}님을 투표하였습니다.`);
    expect(votingLog).toBeVisible();
  });

  describe("투표 종료 테스트", () => {
    test("범인을 찾은 경우", async () => {
      await setupVoting(setupVotingSetting.FOUND_SUSPECT);
    })

    test("범인을 찾지 못한 경우", async () => {
      await setupVoting(setupVotingSetting.NOTFOUND_SUSPECT);
    })

    test("범인인것을 들킨 경우", async () => {
      await setupVoting(setupVotingSetting.SUSPECT_EXPOSED);
    })

    test("투표가 동점일 경우", async () => {
      await setupVoting(setupVotingSetting.TIE_VOTES);
    })
  })
})