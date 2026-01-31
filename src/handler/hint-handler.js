import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { alert, SEQUENCE_END, TABLE_KEYS, timer } from "../modules/modules.js";

class HintHandler {
  initHintTurn(data){
    gameElements.nickname.hide();
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
        gameElements.hint.hide();
      }

      result[nickname] = gameElements.hint.value;

      gameElements.hint.hide();
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
    gameElements.info.category.textContent = category;
    gameElements.info.correct.textContent = myCorrect;
    gameElements.info.state.textContent = `${gameData.playSequence[0]}님이 입력하고 있습니다.`;

    if(gameData.myTurn){
      timer.startTimer(30, this.send);
      alert.show("당신 순서입니다.",`카테고리는 ${category}, 제시어는 ${myCorrect}입니다.`);
      gameData.state = "Playing";
      gameElements.hint.show();
      return;
    }

    timer.startTimer(30);
  }
}

const hintHandler = new HintHandler();
export default hintHandler;