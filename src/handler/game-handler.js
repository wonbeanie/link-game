import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { alert, TABLE_KEYS, timer } from "../modules/modules.js";
import chatHandler from "./chat-handler.js";

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

  reloadEvent(){
    this.removeReloadEvent();
    window.addEventListener('beforeunload', this.outGameEvent);
  }

  removeReloadEvent(){
    window.removeEventListener('beforeunload', this.outGameEvent);
  }

  outGameEvent(e){
    if(gameData.state !== ""){
      let result = {};
      result[TABLE_KEYS.OUT_GAME] = true;
      gameDatabase.updateData(result);
    }
  }

  outGame(){
    alert.show("알림","플레이어중 한명이 나갔습니다.\n게임을 초기화합니다.");
    gameDatabase.clearDatabase();
    this.removeReloadEvent();
    alert.restart = true;
  }

  gameOver(data, findSusepct = false){
    const {correct, fakeCorrect, suspect} = gameData;
    if(findSusepct){
      if(correct === data){
        alert.show("범인 승리", `범인이 정답(${data})을 맞췄습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
      }
      else {
        alert.show("시민 승리",`범인의 최종 답은 ${data}으로 답하였습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
      }
    }
    else {
      if(suspect !== data){
        alert.show("범인이 아닙니다.", `범인은 ${suspect}였습니다.`);
      }
    }

    timer.stopTimer();
    gameHandler.reloadEvent();
    chatHandler.chatClose();
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