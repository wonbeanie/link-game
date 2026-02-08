import { adminHandler, chatHandler, gameHandler, hintHandler, voteHandler } from "./handler/index.js";
import gameElements from "./modules/game-elements.js";

class GameController {
  init(){
    gameElements.admin.start.addEventListener("click",adminHandler.start);
    gameElements.admin.clear.addEventListener("click",adminHandler.clear);
    gameElements.hint.btn.addEventListener("click", hintHandler.send);
    gameElements.answer.btn.addEventListener("click",gameHandler.sendLastAnswer);
    gameElements.vote.btn.addEventListener("click",voteHandler.send);
    gameElements.nickname.btn.addEventListener("click", gameHandler.sendNickname);
  }

  updateChat(newChat){
    chatHandler.settingChatHistory(newChat);
  }
}


const gameController = new GameController();
export default gameController;