import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { correctList } from "../modules/keywords.js";
import { alert, DATABASE_KEYS, pickRandom, shuffleStrings, TABLE_KEYS, timer } from "../modules/modules.js";
import chatHandler from "./chat-handler.js";
import uiHandler from "./ui-handler.js";

class GameHandler {
  newDatabase = {};

  startGame() {
    uiHandler.showGameStartAlert();
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
    uiHandler.updateNicknameUI();
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
    uiHandler.showGameOutAlert();
    gameDatabase.clearDatabase();
    this.removeReloadEvent();
    alert.restart = true;
  }

  gameOver(data, findSusepct = false){
    uiHandler.showGameOverAlert(data, findSusepct);

    timer.stopTimer();
    gameHandler.reloadEvent();
    chatHandler.chatClose();
  }

  createDefaultData = async () => {
    const data = await gameDatabase.getData(DATABASE_KEYS.GAME_DATA_KEY);

    let list = [];

    if(!data){
      return;
    }

    Object.entries(data).forEach(([key, value]) => {
      if(key === TABLE_KEYS.START){
        return;
      }

      list.push(key);
    });

    const keywords = this.generateKeywords();

    const shuffleList = shuffleStrings(list);

    gameData.suspect = pickRandom(shuffleList);
    gameData.category = keywords.category;
    gameData.correct = keywords.correct;
    gameData.fakeCorrect = keywords.fakeCorrect;

    uiHandler.updateGameInfoUI();

    let result = {};

    result[TABLE_KEYS.SEQUENCE] = shuffleList;
    result[TABLE_KEYS.SUSPECT] = gameData.suspect;
    result[TABLE_KEYS.CATEGORY] = gameData.category;
    result[TABLE_KEYS.CORRECT] = gameData.correct;
    result[TABLE_KEYS.FAKE_CORRECT] = gameData.fakeCorrect;

    return result;
  }

  generateKeywords = () => {
    const category = pickRandom(Object.keys(correctList));
    const correct = pickRandom(correctList[category]);

    let noCorrectList = [];

    correctList[category].forEach((data)=>{
      if(correct === data){
        return;
      }
      noCorrectList.push(data);
    });

    const fakeCorrect = pickRandom(noCorrectList);

    return {
      category,
      correct,
      fakeCorrect
    };
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