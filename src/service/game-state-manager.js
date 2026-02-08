import gameDatabase from "../database/database.js";
import { chatHandler, uiHandler } from "../handler/index.js";
import gameStore from "../modules/game-store.js";
import { alert, TABLE_KEYS, timer } from "../modules/modules.js";
import eventBus from "../modules/event-bus.js";
import {GameEvents} from "../modules/events.js";

class GameStateManager {
  constructor(){
    eventBus.on(GameEvents.GAME_OVER, ({data, findSuspect} = {}) => this.gameOver(data, findSuspect));
    eventBus.on(GameEvents.CHANGE_START, () => this.startGame());
    eventBus.on(GameEvents.RELOAD_EVENT, () => this.reloadEvent());
    eventBus.on(GameEvents.PLAYER_OUT, () => this.outGame());
  }

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