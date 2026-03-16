import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";
import gameStore from "../modules/game-store.js";
import { TABLE_KEYS } from "../modules/modules.js";

class MessageHandler {
  votingList = [];
  playerHints = [];

  constructor(){
    eventBus.on(GameEvents.READY_TO_ADD_LOG, (data)=>this.setMessages(data));
    eventBus.on(GameEvents.INIT_GAME_UI, () => this.initGame())
  }

  initGame(){
    this.votingList = [];
    this.playerHints = [];
  }

  setMessages(newData){
    let votingList = {};
    let playerHints = {};
    const { startPlaySequence } = gameStore;
    const startPlaySequenceString = startPlaySequence.join(",");

    Object.entries(newData).forEach(([key, value]) => {
      if((startPlaySequenceString.includes(key) || gameStore.state === "") && startPlaySequence.length === 0){
        eventBus.emit(GameEvents.READY_PLAYER_UI, {
          player : key,
          text : value
        });
        return;
      }

      if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
        const nickname = key.split("-")[1];
        votingList[nickname] = {
          vote : value,
          skip : newData[`${TABLE_KEYS.VOTE_SKIP}-${nickname}`]
        };
        return;
      }

      if(key.includes(TABLE_KEYS.CHAT_HISTORY)){
        eventBus.emit(GameEvents.SET_CHAT_HISTORY, value);
        return;
      }
    });

    this.votingList = Object.entries(votingList);
    this.playerHints = newData[TABLE_KEYS.HINT_LIST] || [];

    this.logView();
  }

  logView(){
    let logData = {};
    this.votingList.forEach(([player, {vote, skip}])=>{
      logData[player] = {
        vote,
        skip
      }
    });

    gameStore.startPlaySequence.forEach((player)=>{
      logData[player] = {
        ...logData[player],
        hint : this.playerHints[player]
      }
    });

    eventBus.emit(GameEvents.READY_LOG_DATA, logData);
  }
}

const messageHandler = new MessageHandler();
export default messageHandler;