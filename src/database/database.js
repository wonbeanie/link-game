import webRTC from "./webRTC.js";
import { DATABASE_KEYS, deepCopy } from "../modules/modules.js";
import gameStore from "../modules/game-store.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";

class GameDatabase {
  listener = {};
  database = {};
  i = 0;
  num = 0;

  constructor(){
    let num = Math.random() * 100;
    this.num = num
  }

  updateData(data, table = DATABASE_KEYS.GAME_DATA_KEY) {
    if(gameStore.admin){
      this.onValue({
        data,
        table
      }, false);
    }
    if(Object.keys(data).length > 0){
      webRTC.send({
        data,
        table
      });
    }
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
    this.i += 1;
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
    let databaseTemp = deepCopy(this.database);

    databaseTemp = {
      ...databaseTemp,
      [table]: {
        ...databaseTemp[table],
        ...data
      }
    }

    Object.entries(databaseTemp[table]).forEach(([key, value])=>{
      if(value === null){
        delete databaseTemp[table][key];
      }
    });

    this.database = databaseTemp;
    this.listener[table](databaseTemp[table]);

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