import gameElements from "../modules/game-elements.js";
import webRTC from "../database/webRTC.js";

class WebRtcService {
  newConnectPlayer(){
    const targetId = gameElements.webrtc.adminId.value;
    const conn = webRTC.peer.connect(targetId);
    webRTC.handleConnection(conn);
  }
}

const webRtcService = new WebRtcService();
export default webRtcService;