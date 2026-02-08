import gameDatabase from "../database/database.js";
import { chatHandler, hintHandler, messageHandler, voteHandler } from "../handler/index.js";
import eventBus from "./event-bus.js";
import { GameEvents } from "./events.js";
import gameStore from "./game-store.js";
import { SEQUENCE_END, TABLE_KEYS } from "./modules.js";

class GameManager {
  newDatabase = {};

  updateGame = (newData) => {
    this.newDatabase = newData;

    if(this.isLastAnswerTurn){
      eventBus.emit(GameEvents.GAME_OVER, {
        data : newData[TABLE_KEYS.LAST_ANSWER],
        findSuspect : true
      });
      return;
    }

    if(this.isPlayerOut){
      eventBus.emit(GameEvents.PLAYER_OUT);
      return;
    }

    this.dispatchGameUpdate();

    eventBus.emit(GameEvents.ADD_LOG, newData);
    eventBus.emit(GameEvents.DRAW_LOG);
  }

  dispatchGameUpdate(){
    voteHandler.playerSelectCheck = [];

    if(this.isInitSetting){
      this.activateGameStart();
      return;
    }

    if(this.isHintTurn){
      this.routeGameFlow();
      return;
    }

    if(this.isVoteEnd){
      voteHandler.votesEnd(this.newDatabase[TABLE_KEYS.SELECT_CULPRIT]);
      return;
    }

    if(this.isTieOfVotes){
      voteHandler.tieOfVotes(this.newDatabase[TABLE_KEYS.RE_SELECT_CULPRIT]);
      return;
    }

    voteHandler.votes(this.newDatabase);
  }

  activateGameStart(){
    gameStore.setDefaultGameInfos(this.newDatabase);
    chatHandler.chatStart();
    gameStore.state = TABLE_KEYS.START;
    eventBus.emit(GameEvents.RELOAD_EVENT);

    const result = {};
    result[TABLE_KEYS.START] = null;
    gameDatabase.updateData(result); 
  }

  routeGameFlow(){
    const sequenceData = this.newDatabase[TABLE_KEYS.SEQUENCE];
    if(sequenceData === SEQUENCE_END){
      voteHandler.voteStart();
      return;
    }

    hintHandler.turnProcessor(sequenceData);

    if(gameStore.state === TABLE_KEYS.START){
      eventBus.emit(GameEvents.CHANGE_START);
    }
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

const gameManager = new GameManager();
export default gameManager;