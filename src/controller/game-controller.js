import { adminHandler, gameHandler, hintHandler, voteHandler } from "../handler/index.js";
import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import gameElements from "../lib/game-elements.js";
import webRtcService from "../service/webrtc-service.js";

class GameController {
  init(){
    gameElements.admin.start.addEventListener("click",adminHandler.start);
    gameElements.admin.clear.addEventListener("click",adminHandler.clear);
    gameElements.hint.btn.addEventListener("click", hintHandler.send);
    gameElements.answer.btn.addEventListener("click",gameHandler.sendLastAnswer);
    gameElements.vote.btn.addEventListener("click",voteHandler.send);
    gameElements.nickname.btn.addEventListener("click", gameHandler.sendNickname);
    gameElements.webrtc.connectBtn.addEventListener("click", webRtcService.newConnectPlayer);
    gameElements.admin.close.addEventListener("click", adminHandler.modalClose);
    gameElements.admin.open.addEventListener("click", adminHandler.modalOpen);
    gameElements.webrtc.copyBtn.addEventListener("click", adminHandler.copyRoomId);
    gameElements.admin.create.addEventListener("click", adminHandler.createRoom);
    gameElements.ready.btn.addEventListener("click", gameHandler.setReady);
    gameElements.vote.skip.btn.addEventListener("click", voteHandler.skip);

    eventBus.emit(GameEvents.INIT_NICKNAME);
  }

  updateChat(newChat){
    eventBus.emit(GameEvents.CHAT_UPDATE, newChat);
  }
}


const gameController = new GameController();
export default gameController;