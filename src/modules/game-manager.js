import gameDatabase from "../database/database.js";
import { chatHandler, gameHandler, hintHandler, messageHandler, voteHandler } from "../handler/index.js";
import gameStore from "./game-store.js";
import { SEQUENCE_END, TABLE_KEYS } from "./modules.js";

class GameManager {
  newDatabase = {};

  updateGame = (newData) => {
    this.newDatabase = newData;

    if(this.isLastAnswerTurn){
      gameHandler.gameOver(newData[TABLE_KEYS.LAST_ANSWER], true);
      return;
    }

    if(this.isPlayerOut){
      gameHandler.outGame();
      return;
    }

    this.dispatchGameUpdate();

    messageHandler.setMessages(newData);
    messageHandler.logView();
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
    gameHandler.reloadEvent();

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
      gameHandler.startGame();
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