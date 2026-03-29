export class Peer {
  constructor(id){
    this.peer = id || "TEST-PEER-ID";
    this.callbacks = {};
    this.connections = [];
  }

  on(event, callback){
    this.callbacks[event] = callback;
    if(event === "open"){
      this.callbacks.open(this.peer);
    }

    if(event === "connection"){
      const conn = this.connect("TEST-PEER-ID-2");
      this.callbacks.connection(conn);
    }
  }

  connect(targetId){
    const conn = new DataConnection(targetId, this);
    this.connections.push(conn);
    return conn;
  }
}

class DataConnection {
  constructor(peerId, remotePeer = null){
    this.peer = peerId;
    this.remotePeer = remotePeer;
    this.callbacks = {};
  }

  on(event, callback){
    this.callbacks[event] = callback;

    if(event === "open"){
      this.callbacks.open();
    }
  }
}

export const userNickname = "유저";
export const nickname = "방장"
export const gameDataTable = "GameData/";
export const secondNickname = "유저2";
export const thirdNickname = "유저3";