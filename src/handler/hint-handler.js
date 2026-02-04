import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { alert, SEQUENCE_END, TABLE_KEYS, timer } from "../modules/modules.js";
import uiHandler from "./ui-handler.js";

class HintHandler {
  initHintTurn(data){
    uiHandler.hideNicknameInputGroup();
    gameData.startPlaySequence = data;
  }

  send(){
    const {playSequence, nickname} = gameData;

    if(gameData.myTurn){
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
    const { category, myCorrect, startPlaySequence } = gameData;
    const notInitHintTurn = startPlaySequence.length === 0;

    if(notInitHintTurn){
      this.initHintTurn(data);
    }

    gameData.playSequence = data;
    uiHandler.updateGameInfoUI();
    uiHandler.updateTurnStateUI();

    if(gameData.myTurn){
      timer.startTimer(30, this.send);
      alert.show("당신 순서입니다.",`카테고리는 ${category}, 제시어는 ${myCorrect}입니다.`);
      gameData.state = "Playing";
      uiHandler.showHintInputGroup();
      return;
    }

    timer.startTimer(30);
  }
}

const hintHandler = new HintHandler();
export default hintHandler;