import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import gameStore from "../lib/game-store.js";
import { TABLE_KEYS } from "../lib/modules.js";

class MessageHandler {
  votingList = {};
  playerHints = {};

  constructor(){
    eventBus.on(GameEvents.READY_TO_ADD_LOG, (data)=>this.setMessages(data));
    eventBus.on(GameEvents.INIT_GAME_UI, () => this.initGame())
  }

  initGame(){
    this.votingList = {};
    this.playerHints = {};
  }

  setMessages(newData){
    let votingList = {};
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

      if(key.includes(TABLE_KEYS.VOTE_LIST)){
        const skipList = newData[TABLE_KEYS.VOTE_SKIP_LIST] || {};
        votingList = Object.fromEntries(
          Object.entries(value).map(([nickname, vote])=>{
            const skip = skipList[nickname] || false;
            return [nickname, {vote, skip}]
          })
        )
        return;
      }

      if(key.includes(TABLE_KEYS.CHAT_HISTORY)){
        eventBus.emit(GameEvents.SET_CHAT_HISTORY, value);
        return;
      }
    });

    this.votingList = votingList;
    this.playerHints = newData[TABLE_KEYS.HINT_LIST] || {};

    this.logView();
  }

  logView(){
    let logData = {...this.votingList};

    gameStore.startPlaySequence.forEach((player)=>{
      logData[player] = {
        ...logData[player],
        hint : this.playerHints[player] ? this.playerHints[player] : ""
      }
    });

    eventBus.emit(GameEvents.READY_LOG_DATA, logData);
  }
}

const messageHandler = new MessageHandler();
export default messageHandler;