import gameDatabase from "./database/database.js";
import { adminHandler, chatHandler, gameHandler, hintHandler, messageHandler, voteHandler } from "./handler/index.js";
import gameData from "./modules/game-data.js";
import gameElements from "./modules/game-elements.js";
import { DATABASE_KEYS, SEQUENCE_END, TABLE_KEYS } from "./modules/modules.js";

class GameController {
  init(){
    gameElements.admin.start.addEventListener("click",adminHandler.start);
    gameElements.admin.clear.addEventListener("click",adminHandler.clear);
    gameElements.hint.btn.addEventListener("click", hintHandler.send);
    gameElements.answer.btn.addEventListener("click",gameHandler.sendLastAnswer);
    gameElements.vote.btn.addEventListener("click",voteHandler.send);
    gameElements.nickname.btn.addEventListener("click", gameHandler.sendNickname);

    gameDatabase.onValueListener(DATABASE_KEYS.CHAT_DATA_KEY, this.updateChat);
    gameDatabase.onValueListener(DATABASE_KEYS.GAME_DATA_KEY, this.updateGame);
  }

  updateChat(newChat){
    chatHandler.settingChatHistory(newChat);
  }

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
    gameData.setDefaultGameInfos(newData);
    chatHandler.chatStart();
    gameData.state = TABLE_KEYS.START;
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

    if(gameData.state === TABLE_KEYS.START){
      gameHandler.startGame();
    }
  }
}


new GameController().init();