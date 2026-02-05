import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { alert, TABLE_KEYS, timer } from "../modules/modules.js";
import adminHandler from "./admin-handler.js";
import gameHandler from "./game-handler.js";
import uiHandler from "./ui-handler.js";

class VoteHandler {
  playerSelectCheck = {};
  selectTimeout = false;
  sendSuspectCheck = false;
  VOTE_TIME = 60;
  SUSEPCT_ANSWER_TIME = 60;

  init(){
    this.sendSuspectCheck = false;
    
    timer.startTimer(this.VOTE_TIME,()=>{
      this.selectTimeout = true;
      this.send();
    });
  
    this.selectTimeout = false;
    this.getVoteTransitionData();
  }

  voteStart(){
    gameStore.playerList = gameStore.startPlaySequence;
    uiHandler.updateSuspectVoteOptions(gameStore.startPlaySequence);
    uiHandler.showVoteTurnAlert();
    uiHandler.showVoteInputGroup();
    uiHandler.hideHintInputGroup();
    this.init();
  }

  getVoteTransitionData(){
    let result = {};
    result[TABLE_KEYS.RE_SELECT_CULPRIT] = null;
    result[TABLE_KEYS.SEQUENCE] = null;
    result[TABLE_KEYS.SELECT_TIMEOUT] = null;

    gameDatabase.updateData(result);
  }

  send(){
    let result = {};
    const {nickname, myVotingKey} = gameStore;
    const {selectTimeout, sendSuspectCheck, playerSelectCheck} = this;

    if(!selectTimeout || (!sendSuspectCheck && !playerSelectCheck[nickname])){
      result[myVotingKey] = gameElements.vote.value;
      this.sendSuspectCheck = true;
    }

    if(selectTimeout){
      result[TABLE_KEYS.SELECT_TIMEOUT] = true;
    }

    gameDatabase.updateData(result);
  }

  calculateResult = () => {
    let selectList = {};

    for (const value of Object.values(this.playerSelectCheck)){
      const selectSuspect = value;
      if(!selectList[selectSuspect]){
        selectList[selectSuspect] = 0;
      }
      selectList[selectSuspect] += 1;
    }

    let maxSuspect = {
      suspect: "",
      count: 0
    };

    let sameList = [];

    for(const [suspect, count] of Object.entries(selectList)){
      if(count > maxSuspect.count){
        maxSuspect.suspect = suspect;
        maxSuspect.count = count;
        sameList = [suspect];
      }
      else if(count === maxSuspect.count){
        sameList.push(suspect);
      }
    }

    let result = {};

    if(sameList.length > 1){
      result[TABLE_KEYS.RE_SELECT_CULPRIT] = sameList;

      gameStore.playerList.forEach((player)=>{
        result[`${TABLE_KEYS.SUSPECT_LIST}-${player}`] = null;
      });
    }
    else {
      result[TABLE_KEYS.SELECT_CULPRIT] = maxSuspect.suspect;
    }

    gameDatabase.updateData(result);
  }

  votesEnd(data){
    const {suspect, isSuspect} = gameStore;
    const failFindSuspect = suspect !== data;
    if(failFindSuspect){
      gameHandler.gameOver();
      return;
    }

    uiHandler.hideVoteInputGroup();

    timer.stopTimer();

    if(isSuspect){
      uiHandler.showAnswerTurnAlert();
      gameStore.lastAnswer = data;
      uiHandler.hideHintInputGroup();
      uiHandler.showAnswerInputGroup();
      timer.startTimer(this.SUSEPCT_ANSWER_TIME, gameHandler.sendLastAnswer);
    }
    else {
      uiHandler.showWeFindSuspectAlert();
      timer.startTimer(this.SUSEPCT_ANSWER_TIME);
    }
  }

  tieOfVotes(data){
    uiHandler.showTieOfVotesAlert(data.join(","));
    uiHandler.updateSuspectVoteOptions(data);
    this.init();
  }

  votes(snapshot){
    Object.keys(snapshot).forEach((key)=>{
      if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
        this.playerSelectCheck[key.split("-")[1]] = snapshot[key];
      }
    });

    if(TABLE_KEYS.SELECT_TIMEOUT in snapshot){
      if(Object.keys(this.playerSelectCheck).length === gameStore.playerList.length && adminHandler.admin){
        this.calculateResult();
      }
    }
  }
}

const voteHandler = new VoteHandler();
export default voteHandler;