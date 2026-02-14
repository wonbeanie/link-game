import webRTC from "../database/webRTC.js";
import { adminHandler, gameHandler, hintHandler, voteHandler } from "../handler/index.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";
import gameElements from "../modules/game-elements.js";
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
    gameElements.admin.close.addEventListener("click", adminHandler.modalClose);
    gameElements.webrtc.copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(gameElements.webrtc.myId.textContent);
    });


    document.getElementById("test").addEventListener("click", () => {
      webRTC.testSend();
    })

    eventBus.emit(GameEvents.INIT_NICKNAME);
  }

  updateChat(newChat){
    eventBus.emit(GameEvents.CHAT_UPDATE, newChat);
  }
}


const gameController = new GameController();
export default gameController;