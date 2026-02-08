import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { TABLE_KEYS } from "../modules/modules.js";
import uiHandler from "./ui-handler.js";

class GameHandler {

  sendLastAnswer(){
    if(gameStore.lastAnswer === gameStore.nickname){
      const newDatabase = {
        [TABLE_KEYS.SELECT_CULPRIT] : "",
        [TABLE_KEYS.LAST_ANSWER] : gameElements.answer.value
      };
      gameDatabase.updateData(newDatabase);
    }
  }

  sendNickname(){
    const nickname = gameElements.nickname.value;
    const newDatabase = {
      [nickname] : "Ready"
    };
    gameDatabase.updateData(newDatabase);

    gameStore.nickname = nickname;
    uiHandler.updateNicknameInfoUI(nickname);
  }
}

const gameHandler = new GameHandler();
export default gameHandler;