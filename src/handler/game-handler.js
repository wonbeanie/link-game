import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { alert, TABLE_KEYS } from "../modules/modules.js";

class GameHandler {
  newDatabase = {};

  startGame() {
    const {category, myCorrect} = gameData;
    alert.show("게임시작", `카테고리는 ${category}, 제시어는 ${myCorrect}입니다.`);
    gameData.state = "Playing";
  }

  sendLastAnswer(){
    if(gameData.lastAnswer === gameData.nickname){
      let result = {};
      result[TABLE_KEYS.LAST_ANSWER] = gameElements.answer.value;
      result[TABLE_KEYS.SELECT_CULPRIT] = "";
      gameDatabase.updateData(result);
    }
  }

  sendNickname(){
    let result = {};
    result[gameElements.nickname.value] = "Ready";
    gameDatabase.updateData(result);

    gameData.nickname = gameElements.nickname.value;
    gameElements.info.nickname.textContent = gameData.nickname;
  }

  set newDatabase(newDatabase){
    this.newDatabase = newDatabase;
  }

  get isHintTurn() {
    return TABLE_KEYS.SEQUENCE in this.newDatabase;
  }

  get isLastAnswerTurn(){
    return TABLE_KEYS.LAST_ANSWER in this.newDatabase;
  }

  get isVoteEnd(){
    return TABLE_KEYS.SELECT_CULPRIT in this.newDatabase;
  }

  get isInitSetting(){
    return TABLE_KEYS.START in this.newDatabase;
  }

  get isTieOfVotes(){
    return TABLE_KEYS.RE_SELECT_CULPRIT in this.newDatabase;
  }

  get isPlayerOut(){
    return TABLE_KEYS.OUT_GAME in this.newDatabase;
  }
}

const gameHandler = new GameHandler();
export default gameHandler;