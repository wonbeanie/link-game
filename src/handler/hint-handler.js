import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { alert, SEQUENCE_END, TABLE_KEYS, timer } from "../modules/modules.js";
import uiHandler from "./ui-handler.js";

class HintHandler {
  initHintTurn(data){
    uiHandler.hideNicknameInputGroup();
    gameStore.startPlaySequence = data;
  }

  send(){
    const {playSequence, nickname} = gameStore;

    if(gameStore.myTurn){
      timer.stopTimer();
      let result = {};

      if(playSequence.length !== 1){
        result[TABLE_KEYS.SEQUENCE] = playSequence.slice(1, playSequence.length);
      }
      else {
        result[TABLE_KEYS.SEQUENCE] = SEQUENCE_END;
        uiHandler.hideHintInputGroup();
      }

      result[nickname] = gameElements.hint.value;

      uiHandler.hideHintInputGroup();
      gameDatabase.updateData(result);
    }
  }

  turnProcessor(data){
    const { category, myCorrect, startPlaySequence } = gameStore;
    const notInitHintTurn = startPlaySequence.length === 0;

    if(notInitHintTurn){
      this.initHintTurn(data);
    }

    gameStore.playSequence = data;
    uiHandler.updateGameInfoUI(category, myCorrect);

    uiHandler.updateTurnStateUI(data[0]);

    if(gameStore.myTurn){
      timer.startTimer(30, this.send);
      uiHandler.showMyTurnAlert(category, myCorrect);
      gameStore.state = "Playing";
      uiHandler.showHintInputGroup();
      return;
    }

    timer.startTimer(30);
  }
}

const hintHandler = new HintHandler();
export default hintHandler;