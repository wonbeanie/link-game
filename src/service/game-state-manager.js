import gameDatabase from "../database/database.js";
import gameStore from "../lib/game-store.js";
import { alert, TABLE_KEYS, timer } from "../lib/modules.js";
import eventBus from "../lib/event-bus.js";
import {GameEvents} from "../lib/events.js";

class GameStateManager {
  constructor(){
    eventBus.on(GameEvents.GAME_OVER, () => this.gameOver());
    eventBus.on(GameEvents.RELOAD_EVENT, () => this.reloadEvent());
    eventBus.on(GameEvents.PLAYER_OUT, () => this.outGame());
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
    gameDatabase.clearDatabase();
    this.removeReloadEvent();
    alert.restart = true;
  }

  gameOver(){
    timer.stopTimer();
    this.reloadEvent();
  }
}

const gameStateManager = new GameStateManager();
export default gameStateManager;