import gameDatabase from "../database/database.js";
import webRTC from "../database/webRTC.js";
import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import gameElements from "../lib/game-elements.js";
import gameStore from "../lib/game-store.js";
import { TABLE_KEYS, WATTING_ROOM_STATE } from "../lib/modules.js";
import gameSetupService from "../service/game-setup-service.js";

class AdminHandler {

  constructor(){
    eventBus.on(GameEvents.SET_INIT_PLAYER_LIST, (data)=>this.setInitPlayerList(data));
    eventBus.on(GameEvents.DONE_INIT_GAME_UI, ()=>this.setInitPlayerList());
    eventBus.on(GameEvents.DONE_SET_ADMIN, () => this.setUpdateMyNickname())
  }

  start = async () => {
    const notReadyPlayerList = Object.fromEntries(
      Object.entries(gameDatabase.wattingRoomPlayerList)
      .filter(([player, state]) => state === WATTING_ROOM_STATE.STANDBY)
    );

    if(Object.keys(notReadyPlayerList).length > 0){
      const notReadyPlayerNames = Object.keys(notReadyPlayerList).join(",")
      eventBus.emit(GameEvents.NOT_READY_PLAYER, notReadyPlayerNames);
      return;
    }

    const defaultData = await gameSetupService.createDefaultData();

    gameDatabase.clearDatabase();

    const newDatabase = {
      ...defaultData,
      [TABLE_KEYS.START] : `Start Game(${new Date().getTime()})`
    };

    gameDatabase.updateData(newDatabase);
    eventBus.emit(GameEvents.CLOSE_ADMIN_MODAL);
  }

  clear = () => {
    gameDatabase.clearDatabase(true);
    eventBus.emit(GameEvents.INIT_GAME_UI);
  }

  modalOpen = () => {
    eventBus.emit(GameEvents.OPEN_ADMIN_MODAL);
  }

  modalClose = () => {
    eventBus.emit(GameEvents.CLOSE_ADMIN_MODAL);
  }

  createRoom = () => {
    if(gameStore.nickname === ""){
      eventBus.emit(GameEvents.NOT_SETTING_NICKNAME);
      return;
    }
    eventBus.emit(GameEvents.CREATE_ROOM);
  }

  setUpdateMyNickname = () => {
    const nickname = gameStore.nickname;
    const newDatabase = {
      [nickname] : WATTING_ROOM_STATE.STANDBY
    };

    gameDatabase.updateData(newDatabase);
  }

  copyRoomId = () => {
    navigator.clipboard.writeText(gameElements.webrtc.myId.textContent);
  }

  setInitPlayerList = (data) => {
    let playerList = {};
    if(!data && gameStore.admin){
      playerList = Object.fromEntries([
        [gameStore.nickname, WATTING_ROOM_STATE.STANDBY],
        ...Object.values(webRTC.connections).map(({nickname})=>{
          return [nickname, WATTING_ROOM_STATE.STANDBY]
        })
      ]);
    }
    else {
      playerList = {
        ...gameDatabase.wattingRoomPlayerList,
        [data.nickname] : WATTING_ROOM_STATE.STANDBY
      };
    }

    gameDatabase.updateData(playerList);
  }
}

const adminHandler = new AdminHandler();
export default adminHandler;