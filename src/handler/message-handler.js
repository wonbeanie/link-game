import gameData from "../modules/game-data.js";
import { logger, TABLE_KEYS } from "../modules/modules.js";
import chatHandler from "./chat-handler.js";

class MessageHandler {
  votingList = [];
  playerHints = [];

  votingLog(){
    if(gameData.state !== ""){
      logger.setLog(`투표`, '---------------');
    }

    this.votingList.forEach(([player, vote])=>{
      logger.setLog(`${player}`, `${vote}님을 투표하였습니다.`);
    });
  }

  hintLog(){
    if(gameData.state !== ""){
      logger.setLog(`힌트`, '---------------');
    }

    gameData.startPlaySequence.forEach((player)=>{
      if(!this.playerHints[player]){
        return;
      }
      
      logger.setLog(player, this.playerHints[player]);
    });
  }

  setMessages(newData){
    logger.clearLog();
    
    let votingList = {};
    let playerHints = {};
    const { startPlaySequence } = gameData;
    const startPlaySequenceString = startPlaySequence.join(",");

    Object.entries(newData).forEach(([key, value]) => {
      if(startPlaySequenceString.includes(key) || gameData.state === ""){
        playerHints[key] = value;

        if(startPlaySequence.length === 0){
          logger.setLog(key, value);
        }
        return;
      }

      if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
        votingList[key.split("-")[1]] = value;
        return;
      }

      if(key.includes(TABLE_KEYS.CHAT_HISTORY)){
        chatHandler.chatHistory = value;
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