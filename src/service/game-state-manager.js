import gameDatabase from "../database/database";
import { chatHandler, uiHandler } from "../handler";
import gameStore from "../modules/game-store";
import { alert, TABLE_KEYS, timer } from "../modules/modules";

class GameStateManager {
  startGame() {
    const {category, myCorrect} = gameStore;
    uiHandler.showGameStartAlert(category, myCorrect);
    gameStore.state = "Playing";
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

  gameOver(data, findSuspect = false){
    const gameInfo = {
      correct : gameStore.correct,
      fakeCorrect : gameStore.fakeCorrect,
      suspect : gameStore.suspect
    }
    uiHandler.showGameOverAlert(gameInfo, data, findSuspect);

    timer.stopTimer();
    this.reloadEvent();
    chatHandler.chatClose();
  }
}

const gameStateManager = new GameStateManager();
export default gameStateManager;