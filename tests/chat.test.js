import { fireEvent, screen, within } from "@testing-library/dom";
import { setupGameStart, setupHTMLInit } from "./modules/game-helpers";

describe("채팅 테스트", () => {
  beforeEach(async ()=>{
    await setupHTMLInit();
    await setupGameStart();
  })

  test("채팅 입력", () => {
    const textChatText = "채팅 Message 입력";
    const chatInput = screen.getByPlaceholderText(/메시지/);

    fireEvent.change(chatInput, {
      target : { value: textChatText }
    });

    const chatSend = screen.getByText("전송");

    chatSend.click();

    const chatTitle = screen.getByText(/채팅$/);

    const chatWindow = chatTitle.nextElementSibling;

    const {getByText} = within(chatWindow);

    getByText(textChatText);
  })
});