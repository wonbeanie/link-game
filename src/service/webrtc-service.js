import gameElements from "../lib/game-elements.js";
import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import gameStore from "../lib/game-store.js";
import lightDB from "../database/lightDB.js";
import { DATABASE_KEYS, WATTING_ROOM_STATE } from "../lib/modules.js";

class WebRtcService {
  async newConnectPlayer(){
    if(gameStore.nickname === ""){
      eventBus.emit(GameEvents.NOT_SETTING_NICKNAME);
      return;
    }
    const targetId = gameElements.webrtc.adminId.value;
    const database = await lightDB.joinRoom(targetId, {
      resetStorage : true
    });
    const nickname = gameStore.nickname;
    const newDatabase = {
      [nickname] : WATTING_ROOM_STATE.STANDBY
    };

    await lightDB.update(DATABASE_KEYS.GAME_DATA_KEY, newDatabase);
    eventBus.emit(GameEvents.RELESE_ROOM);
  }
}

const webRtcService = new WebRtcService();
export default webRtcService;