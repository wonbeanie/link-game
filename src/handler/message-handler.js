import gameStore from "../modules/game-store.js";
import { TABLE_KEYS } from "../modules/modules.js";
import uiHandler from "./ui-handler.js";

class MessageHandler {
  votingList = [];
  playerHints = [];

  votingLog(){
    if(gameStore.state !== ""){
      uiHandler.addLogDisplay(`투표`, '---------------');
    }

    this.votingList.forEach(([player, vote])=>{
      uiHandler.addLogDisplay(`${player}`, `${vote}님을 투표하였습니다.`);
    });
  }

  hintLog(){
    if(gameStore.state !== ""){
      uiHandler.addLogDisplay(`힌트`, '---------------');
    }

    gameStore.startPlaySequence.forEach((player)=>{
      if(!this.playerHints[player]){
        return;
      }
      
      uiHandler.addLogDisplay(player, this.playerHints[player]);
    });
  }

  setMessages(newData){
    uiHandler.clearLogDisplay();
    
    let votingList = {};
    let playerHints = {};
    const { startPlaySequence } = gameStore;
    const startPlaySequenceString = startPlaySequence.join(",");

    Object.entries(newData).forEach(([key, value]) => {
      if(startPlaySequenceString.includes(key) || gameStore.state === ""){
        playerHints[key] = value;

        if(startPlaySequence.length === 0){
          uiHandler.addLogDisplay(key, value);
        }
        return;
      }

      if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
        votingList[key.split("-")[1]] = value;
        return;
      }

      if(key.includes(TABLE_KEYS.CHAT_HISTORY)){
        gameStore.chatHistory = value;
        return;
      }
    });

    this.votingList = Object.entries(votingList);
    this.playerHints = playerHints;
  }

  logView(){
    this.votingLog();
    this.hintLog();
  }
}

const messageHandler = new MessageHandler();
export default messageHandler;