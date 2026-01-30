import gameData from "./game-data.js";
import { alert, TABLE_KEYS } from "./modules.js";

class GameHandler {
  startGame() {
    const {category, myCorrect} = gameData;
    alert.show("게임시작", `카테고리는 ${category}, 제시어는 ${myCorrect}입니다.`);
    gameData.state = "Playing";
  }
}

const gameHandler = new GameHandler();
export default gameHandler;