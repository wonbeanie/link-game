import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";
import gameStore from "../modules/game-store.js";
import { TABLE_KEYS } from "../modules/modules.js";

class MessageHandler {
  votingList = [];
  playerHints = [];

  constructor(){
    eventBus.on(GameEvents.ADD_LOG, (message)=>this.setMessages(message));
    eventBus.on(GameEvents.DRAW_LOG, ()=>this.logView());
  }

  votingLog(){
    let log = [];
    if(gameStore.state !== ""){
      log.push(['투표', '---------------'])
    }

    this.votingList.forEach(([player, vote])=>{
      log.push([`${player}`, `${vote}님을 투표하였습니다.`])
    });

    return log;
  }

  hintLog(){
    let log = [];
    if(gameStore.state !== ""){
      log.push(['힌트', '---------------'])
    }

    gameStore.startPlaySequence.forEach((player)=>{
      if(!this.playerHints[player]){
        return;
      }
      
      log.push([`${player}`, this.playerHints[player]])
    });

    return log;
  }

  setMessages(newData){
    let votingList = {};
    let playerHints = {};
    const { startPlaySequence } = gameStore;
    const startPlaySequenceString = startPlaySequence.join(",");

    Object.entries(newData).forEach(([key, value]) => {
      if(startPlaySequenceString.includes(key) || gameStore.state === ""){
        playerHints[key] = value;

        if(startPlaySequence.length === 0){
          eventBus.emit(GameEvents.READY_PLAYER_UI, {
            player : key,
            text : value
          });
        }
        return;
      }

      if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
        votingList[key.split("-")[1]] = value;
        return;
      }

      if(key.includes(TABLE_KEYS.CHAT_HISTORY)){
        eventBus.emit(GameEvents.SET_CHAT_HISTORY, value);
        return;
      }
    });

    this.votingList = Object.entries(votingList);
    this.playerHints = playerHints;
  }

  logView(){
    const voteLogData = this.votingLog();
    const hintLogData = this.hintLog();

    eventBus.emit(GameEvents.READY_LOG_DATA, {
      vote : voteLogData,
      hint : hintLogData
    });
  }
}

const messageHandler = new MessageHandler();
export default messageHandler;