import { Peer } from 'https://esm.sh/peerjs@1.5.2';
import gameElements from '../modules/game-elements.js';
import gameStore from '../modules/game-store.js';
import gameDatabase from './database.js';
import eventBus from '../modules/event-bus.js';
import { GameEvents } from '../modules/events.js';

class WebRTC {
  peer = null;
  connections = {};
  myIdElement = null;
  peer_id = "";
  request_count = 0;
  MAX_REQUEST_NUM = 100;

  init(){
    const peer = new Peer();
    const myIdElement = gameElements.webrtc.myId;
    
    peer.on('open', (id) => {
      myIdElement.textContent = id;
      this.peer_id = id;
    });

    peer.on('connection', (conn) => {
      this.handleConnection(conn);
    });

    this.peer = peer;
    this.myIdElement = myIdElement;
  }

  handleConnection = (conn) => {
    conn.on('open', () => {
      if (this.connections[conn.peer]) return;

      this.connections[conn.peer] = {
        nickname : "",
        conn
      };

      eventBus.emit(GameEvents.ADD_CHAT_MESSAGE, {
        nickname : "알림",
        message : !gameStore.admin ?
                  "방장과 연결이 완료되었습니다." :
                  `연결된 플레이어 수 : ${Object.keys(this.connections).length}`
      });

      if(!gameStore.admin){
        this.send({
          nickname : gameStore.nickname,
          peerID : this.peer_id
        });
      }

      conn.on('data', (data) => {
        if(data.peerID && gameStore.admin){
          this.connections[data.peerID].nickname = data.nickname;
          eventBus.emit(GameEvents.SET_INIT_PLAYER_LIST, data);
          return;
        }
        gameDatabase.onValue(data);
      });

      conn.on('close', () => {
        delete this.connections[conn.peer];
      });
    });
  }

  send(data){
    if(this.request_count >= this.MAX_REQUEST_NUM){
      eventBus.emit(GameEvents.ADD_CHAT_MESSAGE, {
        nickname : "오류",
        message : "최대 요청 수를 초과하였습니다.",
      });
      return;
    }

    this.request_count += 1;

    const dataToSend = {
      ...data,
      timestamp: Date.now()
    };

    for(const {conn} of Object.values(this.connections)){
      if(conn.open) {
        conn.send(dataToSend);
      }
    }
  }
}

const webRTC = new WebRTC();
export default webRTC;