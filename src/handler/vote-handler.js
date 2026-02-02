import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { alert, TABLE_KEYS, timer } from "../modules/modules.js";

class VoteHandler {
  playerSelectCheck = {};
  selectTimeout = false;
  sendSuspectCheck = false;
  VOTE_TIME = 60;

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
    this.setSuspectVoteList(gameData.startPlaySequence);
    alert.show("토론시간", "1분의 토론시간이 주어집니다.");
    gameElements.vote.show();
    gameElements.hint.hide();
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

  setSuspectVoteList(voteList){
    gameElements.vote.allClearChildren();
    
    JSON.parse(JSON.stringify(voteList)).sort().forEach((player)=>{
      const optionElement = document.createElement("option");
      optionElement.value = player;
      optionElement.textContent = player;

      gameElements.vote.appendChild(optionElement);
    });
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
}

const voteHandler = new VoteHandler();
export default voteHandler;