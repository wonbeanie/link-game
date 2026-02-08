import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { alert, TABLE_KEYS, timer } from "../modules/modules.js";
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
}

const gameHandler = new GameHandler();
export default gameHandler;