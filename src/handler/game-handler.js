import gameDatabase from "../database/database.js";
import gameStore from "../lib/game-store.js";
import gameElements from "../lib/game-elements.js";
import { DATABASE_KEYS, TABLE_KEYS, WATTING_ROOM_STATE } from "../lib/modules.js";
import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import lightDB from "../database/lightDB.js";

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
    eventBus.emit(GameEvents.REQUEST_CHANGE_NICKNAME, nickname);
  }

  async setReady(){
    const {nickname} = gameStore;
    const newDatabase = {
      [nickname] : WATTING_ROOM_STATE.READY
    };
    await lightDB.update(DATABASE_KEYS.GAME_DATA_KEY, newDatabase);
  }
}

const gameHandler = new GameHandler();
export default gameHandler;