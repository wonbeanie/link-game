import gameData from "../modules/game-data.js";
import gameDatabase from "../database/database.js";
import { DATABASE_KEYS, TABLE_KEYS } from "../modules/modules.js";
import uiHandler from "./ui-handler.js";

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
    const chatInput = this.getChatInput();
    const chatSend = this.getChatSend();

    chatSend.addEventListener('click', this.sendClick);
    chatInput.addEventListener('keypress', this.onEnterPress);
    this.startChat = true;
    this.addChatMessage("서버", "채팅에 접속하였습니다.");
  }

  sendClick = () => {
    const chatInput = this.getChatInput();
    const msg = chatInput.value.trim();
    this.onSendClick(msg);
    chatInput.value = '';
  }

  chatClose(){
    const chatInput = this.getChatInput();
    const chatSend = this.getChatSend();

    chatSend.removeEventListener('click', this.sendClick);
    chatInput.removeEventListener('keypress', this.onEnterPress);
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
    const chatSend = this.getChatSend();
    if (e.key === 'Enter') chatSend.click();
  }


  getChatInput(){
    if(!this.chatInput){
      this.chatInput = document.getElementById('chat-input');
    }

    return this.chatInput;
  }

  getChatSend(){
    if(!this.chatSend){
      this.chatSend = document.getElementById('chat-send');
    }

    return this.chatSend;
  }
}

const chatHandler = new ChatHandler();
export default chatHandler;