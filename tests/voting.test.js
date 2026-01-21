import { fireEvent, screen, within } from "@testing-library/dom";
import { checkAlert, setupGameStart, setupHTMLInit, setupSendHint } from "./modules/game-helpers";
import { nickname, secondNickname, thirdNickname, userNickname } from "./__mocks__/mock-firebase-database";
import { MOCK_CORRECT, MOCK_FAKE_CORRECT, setupVoting, setupVotingSetting } from "./modules/vote-helpers";

describe("투표 테스트", () => {
  beforeEach(async ()=>{
    jest.useFakeTimers();
    await setupHTMLInit();
  });

  afterEach(() => {
    jest.useRealTimers();
  })

  describe("플레이어 2명인 경우", () => {
    beforeEach(async ()=>{
      await setupGameStart();
      await setupSendHint();
    });

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
      describe("범인인것을 들킨 경우", () => {
        test.each([
          { 
            desc: "시민의 키워드을 틀렸을때", 
            suspectAnswerSetting: MOCK_FAKE_CORRECT,
            expectedAlertText: "시민 승리"
          },
          { 
            desc: "시민의 키워드을 맞췄을때", 
            suspectAnswerSetting: MOCK_CORRECT,
            expectedAlertText: "범인 승리"
          },
        ])("$desc", async ({ suspectAnswerSetting, expectedAlertText }) => {
          await setupVoting(setupVotingSetting.SUSPECT_EXPOSED);
          const suspectAnswer = screen.getByPlaceholderText("시민의 정답은?");
          expect(suspectAnswer).toBeVisible();
          fireEvent.change(suspectAnswer, {
            target : { value: suspectAnswerSetting }
          });
          const suspectAnswerBtn = screen.getByText("정답 맞추기");
          suspectAnswerBtn.click();
          await checkAlert(expectedAlertText);
        });
      });

      test("범인을 찾은 경우", async () => {
        await setupVoting(setupVotingSetting.FOUND_SUSPECT);
      })

      test("범인을 찾지 못한 경우", async () => {
        await setupVoting(setupVotingSetting.NOTFOUND_SUSPECT);
      })
    })
  })

  describe("플레이어가 4인인 경우", () => {
    beforeEach(async ()=>{
      await setupGameStart([userNickname, secondNickname, thirdNickname]);
      await setupSendHint();
    });

    test("투표가 동점일 경우", async () => {
      await setupVoting(setupVotingSetting.TIE_VOTES);
    })
  })
})