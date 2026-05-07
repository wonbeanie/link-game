import gameDatabase from "../database/database.js";
import gameStore from "../lib/game-store.js";
import gameElements from "../lib/game-elements.js";
import { DATABASE_KEYS, SEQUENCE_END, TABLE_KEYS, timer } from "../lib/modules.js";
import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import lightDB from "../database/lightDB.js";

class HintHandler {
  constructor(){
    eventBus.on(GameEvents.NEXT_TURN, (data)=>this.turnProcessor(data));
    eventBus.on(GameEvents.INIT_GAME_UI, ()=>timer.stopTimer());
  }

  initHintTurn(data){
    eventBus.emit(GameEvents.INIT_HINT, data);
  }

  async send(){
    const {playSequence, nickname} = gameStore;

    if(gameStore.myTurn){
      timer.stopTimer();
      const newSequence = playSequence.length !== 1
                        ? playSequence.slice(1, playSequence.length)
                        : SEQUENCE_END;

      const newDatabase = {
        [TABLE_KEYS.SEQUENCE] : newSequence,
        [TABLE_KEYS.HINT_LIST] : {
          [nickname] : gameElements.hint.value
        }
      }

      await lightDB.update(DATABASE_KEYS.GAME_DATA_KEY, newDatabase);
      eventBus.emit(GameEvents.TURN_END_HINT);
    }
  }

  turnProcessor(data){
    const { category, myCorrect, startPlaySequence } = gameStore;
    const notInitHintTurn = startPlaySequence.length === 0;

    if(notInitHintTurn){
      this.initHintTurn(data);
    }

    eventBus.emit(GameEvents.SET_PLAY_SEQUENCE, data);
    eventBus.emit(GameEvents.UPDATE_TURN_UI, {
      correctTurn : data[0],
      category,
      correct : myCorrect
    })

    if(gameStore.myTurn){
      timer.startTimer(30, this.send);
      eventBus.emit(GameEvents.TURN_START_HINT, {
        correct : myCorrect,
        category,
      });
      return;
    }

    timer.startTimer(30);
  }
}

const hintHandler = new HintHandler();
export default hintHandler;