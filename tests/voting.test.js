import { screen, waitFor } from "@testing-library/dom";
import { setupGameStart, setupHTMLInit, setupSendHint } from "./modules/game-helpers";

describe("토론 및 투표 테스트", () => {
  beforeEach(async ()=>{
    await setupHTMLInit();
    await setupGameStart();
    await setupSendHint();
  });

  test("토론 및 투표 팝업 확인", async () => {
    screen.findByText(/범인 지목 투표/);
  });
})