import gameDatabase from "./database.js";
import gameData from "./game-data.js";
import gameElements from "./Game-Elements.js";
import { TABLE_KEYS } from "./modules.js";

class VoteHandler {
  playerSelectCheck = [];
  selectTimeout = false;
  sendSuspectCheck = false;

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