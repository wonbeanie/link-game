import gameElements from "./Game-Elements.js";

class VoteHandler {
  playerSelectCheck = [];
  selectTimeout = false;
  sendSuspectCheck = false;

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