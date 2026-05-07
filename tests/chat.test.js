import { fireEvent, screen, within } from "@testing-library/dom";
import { setupGameStart, setupHTMLInit } from "./lib/game-helpers";
import { getDatabase } from "./lib/database-helpers";
import { DATABASE_KEYS, TABLE_KEYS } from "../src/lib/modules";

describe("채팅 테스트", () => {
  beforeEach(async ()=>{
    await setupHTMLInit();
    await setupGameStart();

    const lightDB = await getDatabase();
    lightDB.emitPeer("connection");
  })

  test("채팅 입력", async () => {
    const textChatText = "채팅 Message 입력";
    const chatInput = screen.getByPlaceholderText(/메시지/);

    fireEvent.change(chatInput, {
      target : { value: textChatText }
    });

    const chatSend = screen.getByText("전송");

    fireEvent.click(chatSend);

    const chatTitle = screen.getByText(/채팅$/);

    const chatWindow = chatTitle.nextElementSibling;

    const {findByText} = within(chatWindow);

    const lightDB = await getDatabase();
    expect(lightDB.database[DATABASE_KEYS.CHAT_DATA_KEY][TABLE_KEYS.CHAT_HISTORY]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: textChatText
        })
      ])
    );

    await findByText(textChatText);
  })
});
