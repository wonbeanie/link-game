import gameElements from "../modules/game-elements.js";
import webRTC from "../database/webRTC.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";
import gameStore from "../modules/game-store.js";

class WebRtcService {
  newConnectPlayer(){
    if(gameStore.nickname === ""){
      eventBus.emit(GameEvents.NOT_SETTING_NICKNAME);
      return;
    }
    const targetId = gameElements.webrtc.adminId.value;
    const conn = webRTC.peer.connect(targetId);
    webRTC.handleConnection(conn);
    eventBus.emit(GameEvents.RELESE_ROOM);
  }
}

const webRtcService = new WebRtcService();
export default webRtcService;