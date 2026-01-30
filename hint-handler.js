import gameDatabase from "./database";
import gameData from "./game-data.js";
import gameElements from "./Game-Elements.js";
import { TABLE_KEYS, timer } from "./modules.js";

class HintHandler {
  send(){
    const {myTurn, playSequence, nickname} = gameData;
    if(myTurn){
      timer.stopTimer();
      let result = {};

      if(playSequence.length !== 1){
        result[TABLE_KEYS.SEQUENCE] = playSequence.slice(1, playSequence.length);
      }
      else {
        result[TABLE_KEYS.SEQUENCE] = "end";
        gameElements.hint.hide();
      }

      result[nickname] = gameElements.hint.value;

      gameElements.hint.hide();
      gameDatabase.updateData(result);
    }
  }
}

const hintHandler = new HintHandler();
export default hintHandler;