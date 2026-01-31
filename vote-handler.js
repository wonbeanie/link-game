import gameDatabase from "./database.js";
import gameData from "./game-data.js";
import gameElements from "./Game-Elements.js";
import { TABLE_KEYS, timer } from "./modules.js";

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