import webRTC from "./webRTC.js";
import { DATABASE_KEYS } from "../lib/modules.js";
import gameStore from "../lib/game-store.js";
import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import { updateTable } from "../lib/database-utils.js";
import lightDB from "./lightDB.js";

class GameDatabase {
  listener = {};
  database = {};

  updateData(data, table = DATABASE_KEYS.GAME_DATA_KEY, resend = true) {
    return;
    // if(gameStore.admin){
    //   this.onValue({
    //     data,
    //     table
    //   }, false);
    //   if(!resend){
    //     return;
    //   }
    // }
    // if(Object.keys(data).length > 0){
    //   webRTC.send({
    //     data,
    //     table,
    //     resend
    //   });
    // }
  }
  
  clearDatabase(uiClear = false) {
    this.database = {};
    webRTC.send({
      data : {},
      table : "/",
      uiClear
    });
  }

  onValueListener(key, callback){
    this.listener = {
      ...this.listener,
      [key]: (data)=>{
        if(null === data){
          return;
        }
        callback(data);
      }
    }
  }

  onValue({table, data, uiClear = false}, send = true){
    if(table === "/"){
      this.database = data;
      if(uiClear){
        eventBus.emit(GameEvents.INIT_GAME_UI);
      }
      return;
    }
    
    if(!this.listener[table]){
      return;
    }

    const newDatabase = {
      ...this.database,
      [table] : updateTable(this.database[table], data)
    };

    this.database = newDatabase;
    this.listener[table](newDatabase[table]);

    if(gameStore.admin && send){
      webRTC.send({
        data,
        table
      });
    }
  }

  async getData(key){
    return this.database[key];
  }

  get wattingRoomPlayerList(){
    return this.database[DATABASE_KEYS.GAME_DATA_KEY];
  }
}

const gameDatabase = new GameDatabase();
export default gameDatabase;