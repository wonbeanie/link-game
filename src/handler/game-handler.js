import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { TABLE_KEYS } from "../modules/modules.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";

class GameHandler {
  sendLastAnswer(){
    if(gameStore.isLastAnswerTurn){
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

    eventBus.emit(GameEvents.REQUEST_CHANGE_NICKNAME, nickname);
  }
}

const gameHandler = new GameHandler();
export default gameHandler;