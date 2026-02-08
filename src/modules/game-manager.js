import gameDatabase from "../database/database.js";
import { chatHandler, gameHandler, hintHandler, messageHandler, voteHandler } from "../handler/index.js";
import gameStore from "./game-store.js";
import { SEQUENCE_END, TABLE_KEYS } from "./modules.js";

class GameManager {
  updateGame = (newData) => {
    gameHandler.newDatabase = newData;

    if(gameHandler.isLastAnswerTurn){
      gameHandler.gameOver(newData[TABLE_KEYS.LAST_ANSWER], true);
      return;
    }

    if(gameHandler.isPlayerOut){
      gameHandler.outGame();
      return;
    }

    this.dispatchGameUpdate(newData);

    messageHandler.setMessages(newData);
    messageHandler.logView();
  }

  dispatchGameUpdate(newData){
    voteHandler.playerSelectCheck = [];

    if(gameHandler.isInitSetting){
      this.activateGameStart(newData);
      return;
    }

    if(gameHandler.isHintTurn){
      this.routeGameFlow(newData[TABLE_KEYS.SEQUENCE]);
      return;
    }

    if(gameHandler.isVoteEnd){
      voteHandler.votesEnd(newData[TABLE_KEYS.SELECT_CULPRIT]);
      return;
    }

    if(gameHandler.isTieOfVotes){
      voteHandler.tieOfVotes(newData[TABLE_KEYS.RE_SELECT_CULPRIT]);
      return;
    }

    voteHandler.votes(newData);
  }

  activateGameStart(newData){
    gameStore.setDefaultGameInfos(newData);
    chatHandler.chatStart();
    gameStore.state = TABLE_KEYS.START;
    gameHandler.reloadEvent();

    const result = {};
    result[TABLE_KEYS.START] = null;
    gameDatabase.updateData(result); 
  }

  routeGameFlow(data){
    if(data === SEQUENCE_END){
      voteHandler.voteStart();
      return;
    }

    hintHandler.turnProcessor(data);

    if(gameStore.state === TABLE_KEYS.START){
      gameHandler.startGame();
    }
  }
}

const gameManager = new GameManager();
export default gameManager;