import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { alert, TABLE_KEYS, timer } from "../modules/modules.js";

class VoteHandler {
  playerSelectCheck = [];
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
    return this.getVoteTransitionData();
  }

  voteStart(){
    gameData.playerList = gameData.startPlaySequence;
    this.setSuspectVoteList(gameData.startPlaySequence);
    alert.show("토론시간", "1분의 토론시간이 주어집니다.");
    gameElements.vote.show();
    gameElements.hint.hide();

    return this.init();
  }

  getVoteTransitionData(){
    let result = {};
    result[TABLE_KEYS.RE_SELECT_CULPRIT] = null;
    result[TABLE_KEYS.SEQUENCE] = null;
    result[TABLE_KEYS.SELECT_TIMEOUT] = null;
    return result;
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
}

const voteHandler = new VoteHandler();
export default voteHandler;