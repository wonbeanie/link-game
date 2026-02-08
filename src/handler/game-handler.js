import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { correctList } from "../modules/keywords.js";
import { alert, DATABASE_KEYS, pickRandom, shuffleStrings, TABLE_KEYS, timer } from "../modules/modules.js";
import chatHandler from "./chat-handler.js";
import uiHandler from "./ui-handler.js";

class GameHandler {

  startGame() {
    const {category, myCorrect} = gameStore;
    uiHandler.showGameStartAlert(category, myCorrect);
    gameStore.state = "Playing";
  }

  sendLastAnswer(){
    if(gameStore.lastAnswer === gameStore.nickname){
      const newDatabase = {
        [TABLE_KEYS.SELECT_CULPRIT] : "",
        [TABLE_KEYS.LAST_ANSWER] : gameElements.answer.value
      };
      gameDatabase.updateData(newDatabase);
    }
  }

  sendNickname(){
    const nickname = gameElements.nickname.value;
    const newDatabase = {
      [nickname] : "Ready"
    };
    gameDatabase.updateData(newDatabase);

    gameStore.nickname = nickname;
    uiHandler.updateNicknameInfoUI(nickname);
  }

  reloadEvent(){
    this.removeReloadEvent();
    window.addEventListener('beforeunload', this.outGameEvent);
  }

  removeReloadEvent(){
    window.removeEventListener('beforeunload', this.outGameEvent);
  }

  outGameEvent(e){
    if(gameStore.state !== ""){
      const newDatabase = {
        [TABLE_KEYS.OUT_GAME] : true
      };
      gameDatabase.updateData(newDatabase);
    }
  }

  outGame(){
    uiHandler.showGameOutAlert();
    gameDatabase.clearDatabase();
    this.removeReloadEvent();
    alert.restart = true;
  }

  gameOver(data, findSusepct = false){
    const gameInfo = {
      correct : gameStore.correct,
      fakeCorrect : gameStore.fakeCorrect,
      suspect : gameStore.suspect
    }
    uiHandler.showGameOverAlert(gameInfo, data, findSusepct);

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

    const newDatabase = {
      [TABLE_KEYS.SEQUENCE] : shuffleList,
      [TABLE_KEYS.SUSPECT] : pickRandom(shuffleList),
      [TABLE_KEYS.CATEGORY] : keywords.category,
      [TABLE_KEYS.CORRECT] : keywords.correct,
      [TABLE_KEYS.FAKE_CORRECT] : keywords.fakeCorrect
    };

    gameStore.setDefaultGameInfos(newDatabase);

    const {category, myCorrect} = gameStore;
    uiHandler.updateGameInfoUI(category, myCorrect);

    return newDatabase;
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
}

const gameHandler = new GameHandler();
export default gameHandler;