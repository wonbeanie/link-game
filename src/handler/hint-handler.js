import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { SEQUENCE_END, TABLE_KEYS, timer } from "../modules/modules.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";

class HintHandler {
  constructor(){
    eventBus.on(GameEvents.NEXT_TURN, (data)=>this.turnProcessor(data));
    eventBus.on(GameEvents.INIT_GAME_UI, ()=>timer.stopTimer());
  }

  initHintTurn(data){
    eventBus.emit(GameEvents.INIT_HINT, data);
  }

  send(){
    const {playSequence, nickname} = gameStore;

    if(gameStore.myTurn){
      timer.stopTimer();
      const newSequence = playSequence.length !== 1
                        ? playSequence.slice(1, playSequence.length)
                        : SEQUENCE_END;

      const newDatabase = {
        [TABLE_KEYS.SEQUENCE] : newSequence,
        [nickname] : gameElements.hint.value
      }

      gameDatabase.updateData(newDatabase);
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