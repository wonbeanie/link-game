import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
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
    gameData.playerList = gameData.startPlaySequence;
    uiHandler.updateSuspectVoteOptions(gameData.startPlaySequence);
    alert.show("토론시간", "1분의 토론시간이 주어집니다.");
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
    const {nickname, myVotingKey} = gameData;
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

      gameData.playerList.forEach((player)=>{
        result[`${TABLE_KEYS.SUSPECT_LIST}-${player}`] = null;
      });
    }
    else {
      result[TABLE_KEYS.SELECT_CULPRIT] = maxSuspect.suspect;
    }

    gameDatabase.updateData(result);
  }

  votesEnd(data){
    const {suspect, isSuspect} = gameData;
    const failFindSuspect = suspect !== data;
    if(failFindSuspect){
      gameHandler.gameOver(data);
      return;
    }

    uiHandler.hideVoteInputGroup();

    timer.stopTimer();

    if(isSuspect){
      alert.show("범인인것을 걸렸습니다.", "정답을 맞춰주세요.");
      gameData.lastAnswer = data;
      uiHandler.hideHintInputGroup();
      uiHandler.showAnswerInputGroup();
      timer.startTimer(this.SUSEPCT_ANSWER_TIME, gameHandler.sendLastAnswer);
    }
    else {
      alert.show("범인을 찾았습니다.", "범인이 답을 입력하고 있습니다.");
      timer.startTimer(this.SUSEPCT_ANSWER_TIME);
    }
  }

  tieOfVotes(data){
    alert.show("투표 동점", `${data.join(",")}중에 한명을 선택해주세요.`);
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
      if(Object.keys(this.playerSelectCheck).length === gameData.playerList.length && adminHandler.admin){
        this.calculateResult();
      }
    }
  }
}

const voteHandler = new VoteHandler();
export default voteHandler;