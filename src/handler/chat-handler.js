import gameStore from "../lib/game-store.js";
import gameDatabase from "../database/database.js";
import { DATABASE_KEYS, deepCopy, TABLE_KEYS } from "../lib/modules.js";
import gameElements from "../lib/game-elements.js";
import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";

class ChatHandler {
  constructor(){
    eventBus.on(GameEvents.CHAT_START, ()=>this.chatStart());
    eventBus.on(GameEvents.CHAT_CLOSE, ()=>this.chatClose());
    eventBus.on(GameEvents.CHAT_UPDATE, (data)=>this.chatUpdate(data));
    eventBus.on(GameEvents.DONE_INIT_GAME_UI, ()=>this.chatStart());
  }

  chatUpdate(newChatData){
    const newChatHistory = newChatData[TABLE_KEYS.CHAT_HISTORY];
    if(!newChatHistory){
      return;
    }
    const lastChat = newChatHistory[newChatHistory.length-1];
    this.addChatMessage(lastChat.nickname, lastChat.message);
  }

  addChatMessage(nickname, message) {
    if(!gameStore.startChat){
      return;
    }
    eventBus.emit(GameEvents.ADD_CHAT_MESSAGE, {nickname, message});
  }

  chatStart(){
    if(gameStore.startChat){
      return;
    }
    gameElements.chat.btn.addEventListener('click', this.sendClick);
    gameElements.chat.input.addEventListener('keypress', this.onEnterPress);
    gameStore.startChat = true;
    this.addChatMessage("서버", "채팅에 접속하였습니다.");
  }

  sendClick = () => {
    const msg = gameElements.chat.input.value.trim();
    this.onSendClick(msg);
  }

  chatClose(){
    gameElements.chat.btn.removeEventListener('click', this.sendClick);
    gameElements.chat.input.removeEventListener('keypress', this.onEnterPress);
    this.addChatMessage("서버", "채팅이 종료되었습니다.");
    gameStore.startChat = false;
  }

  onSendClick = (msg) => {
    if (msg) {
      const MAX_CHAT_LENGTH = 30;
      const newChatHistory = gameStore.chatHistory.length >= MAX_CHAT_LENGTH
                       ? gameStore.chatHistory.slice(1)
                       : deepCopy(gameStore.chatHistory);

      newChatHistory.push({
        nickname : gameStore.nickname,
        message : msg
      });

      eventBus.emit(GameEvents.SET_CHAT_HISTORY, newChatHistory);

      const newDatabase = {
        [TABLE_KEYS.CHAT_HISTORY] : newChatHistory
      };

      gameDatabase.updateData(newDatabase, DATABASE_KEYS.CHAT_DATA_KEY);
    }
  }

  onEnterPress = (e) => {
    if (e.key === 'Enter') gameElements.chat.btn.click();
  }
}

const chatHandler = new ChatHandler();
export default chatHandler;