import gameData from "../modules/game-data.js";
import gameDatabase from "../database/database.js";
import { DATABASE_KEYS, TABLE_KEYS } from "../modules/modules.js";
import uiHandler from "./ui-handler.js";
import gameElements from "../modules/game-elements.js";

class ChatHandler {
  chatInput = null;
  chatSend = null;
  startChat = false;
  chatHistory = [];

  addChatMessage(nickname, message) {
    if(!this.startChat){
      return;
    }
    uiHandler.addChatMessageToDisplay(nickname, message);
  }

  chatClear(){
    uiHandler.clearChatMessageToDisplay();
    if(this.startChat){
      this.addChatMessage("서버", "채팅에 접속하였습니다.");
      return;
    }
  }

  chatStart(){
    gameElements.chat.btn.addEventListener('click', this.sendClick);
    gameElements.chat.input.addEventListener('keypress', this.onEnterPress);
    this.startChat = true;
    this.addChatMessage("서버", "채팅에 접속하였습니다.");
  }

  sendClick = () => {
    const msg = gameElements.chat.input.value.trim();
    this.onSendClick(msg);
    uiHandler.clearChatInput();
  }

  chatClose(){
    gameElements.chat.btn.removeEventListener('click', this.sendClick);
    gameElements.chat.input.removeEventListener('keypress', this.onEnterPress);
    this.addChatMessage("서버", "채팅이 종료되었습니다.");
    this.startChat = false;
  }

  onSendClick = (msg) => {
    if (msg) {
      let result = {};

      if(this.chatHistory.length >= 30){
        this.chatHistory.shift();
      }

      this.chatHistory.push({
        nickname : gameData.nickname,
        message : msg
      });

      result[TABLE_KEYS.CHAT_HISTORY] = this.chatHistory;

      gameDatabase.updateData(result, DATABASE_KEYS.CHAT_DATA_KEY);
    }
  }

  settingChatHistory(newChatData){
    this.chatHistory = newChatData[TABLE_KEYS.CHAT_HISTORY];
    this.chatClear();
    this.chatHistory.forEach((chat)=>{
      this.addChatMessage(chat.nickname, chat.message);
    });
  }

  onEnterPress = (e) => {
    if (e.key === 'Enter') gameElements.chat.btn.click();
  }
}

const chatHandler = new ChatHandler();
export default chatHandler;