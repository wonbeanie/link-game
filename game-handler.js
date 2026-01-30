import gameData from "./game-data.js";
import gameElements from "./Game-Elements.js";
import hintHandler from "./hint-handler.js";
import { alert, TABLE_KEYS, timer } from "./modules.js";

class GameHandler {
  startGame() {
    const {category, myCorrect, playSequence} = gameData;
    
    gameElements.info.category.textContent = category;
    gameElements.info.correct.textContent = myCorrect;
    gameElements.info.state.textContent = `${playSequence[0]}님이 입력하고 있습니다.`;

    if(gameData.myTurn){
      timer.startTimer(30, hintHandler.send);
      alert.show("당신 순서입니다.",`카테고리는 ${category}, 제시어는 ${myCorrect}입니다.`);
      gameData.state = "Playing";
      gameElements.hint.show();
      return;
    }
    else {
      timer.startTimer(30);
    }
    
    if(gameData.state === TABLE_KEYS.START){
      alert.show("게임시작", `카테고리는 ${category}, 제시어는 ${myCorrect}입니다.`);
      gameData.state = "Playing";
    }
  }
}

const gameHandler = new GameHandler();
export default gameHandler;