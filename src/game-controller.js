import gameDatabase from "./database/database.js";
import gameManager from "./modules/game-manager.js";
import { adminHandler, chatHandler, gameHandler, hintHandler, voteHandler } from "./handler/index.js";
import gameElements from "./modules/game-elements.js";
import { DATABASE_KEYS } from "./modules/modules.js";
import "./service/game-state-manager.js";

class GameController {
  init(){
    gameElements.admin.start.addEventListener("click",adminHandler.start);
    gameElements.admin.clear.addEventListener("click",adminHandler.clear);
    gameElements.hint.btn.addEventListener("click", hintHandler.send);
    gameElements.answer.btn.addEventListener("click",gameHandler.sendLastAnswer);
    gameElements.vote.btn.addEventListener("click",voteHandler.send);
    gameElements.nickname.btn.addEventListener("click", gameHandler.sendNickname);

    gameDatabase.onValueListener(DATABASE_KEYS.CHAT_DATA_KEY, this.updateChat);
    gameDatabase.onValueListener(DATABASE_KEYS.GAME_DATA_KEY, gameManager.updateGame);
  }

  updateChat(newChat){
    chatHandler.settingChatHistory(newChat);
  }
}


new GameController().init();