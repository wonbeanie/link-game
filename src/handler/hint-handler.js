import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { GAME_STATE, SEQUENCE_END, TABLE_KEYS, timer } from "../modules/modules.js";
import uiHandler from "./ui-handler.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";

class HintHandler {
  constructor(){
    eventBus.on(GameEvents.NEXT_TURN, (playerList)=>this.turnProcessor(playerList));
  }

  initHintTurn(data){
    uiHandler.hideNicknameInputGroup();
    eventBus.emit(GameEvents.SET_PLAYER_LIST, data);
  }

  send(){
    const {playSequence, nickname} = gameStore;

    if(gameStore.myTurn){
      timer.stopTimer();
      const newSequence = playSequence.length !== 1
                        ? playSequence.slice(1, playSequence.length)
                        : SEQUENCE_END;

      if(newSequence === SEQUENCE_END){
        uiHandler.hideHintInputGroup();
      }

      const newDatabase = {
        [TABLE_KEYS.SEQUENCE] : newSequence,
        [nickname] : gameElements.hint.value
      }

      uiHandler.hideHintInputGroup();
      gameDatabase.updateData(newDatabase);
    }
  }

  turnProcessor(data){
    const { category, myCorrect, startPlaySequence } = gameStore;
    const notInitHintTurn = startPlaySequence.length === 0;

    if(notInitHintTurn){
      this.initHintTurn(data);
    }

    eventBus.emit(GameEvents.SET_PLAY_SEQUENCE, data);
    uiHandler.updateGameInfoUI(category, myCorrect);

    uiHandler.updateTurnStateUI(data[0]);

    if(gameStore.myTurn){
      timer.startTimer(30, this.send);
      uiHandler.showMyTurnAlert(category, myCorrect);
      eventBus.emit(GameEvents.STATE_UPDATE, GAME_STATE.PLAYING);
      uiHandler.showHintInputGroup();
      return;
    }

    timer.startTimer(30);
  }
}

const hintHandler = new HintHandler();
export default hintHandler;