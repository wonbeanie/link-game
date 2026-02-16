export class Peer {
  peer = "TEST-PEER-ID";
  connection = null;
  callbacks = {
    open : () => {},
    connect : () => {},
    data : () => {},
    close : () => {}
  };

  constructor(peer, connection = null){
    this.peer = peer;
    this.connection = connection;
    this.open();
  }

  on(event, callback){
    switch(event){
      case 'open':
        callbacks.open = callback;
        break;
      case 'connection':
        callbacks.connect = callback;
        break;
      case 'data':
        callbacks.data = callback;
        break;
      case 'close':
        callbacks.close = callback;
        break;
    }
  }

  open(){
    this.callbacks.open(this.peer);
  }

  connect(){
    const newConnection = new Peer("TEST-PEER-ID-2", this);
    this.connection = newConnection;
    this.callbacks.connect(newConnection);
  }

  send(data){
    this.connection.data(data);
  }

  data(data){
    this.callbacks.data(data);
  }

  close(){
    this.connection = null;
    if(this.connection.connection !== null){
      this.connection.close();
    }

    this.callbacks.close();
  }
}

export const userNickname = "유저";
export const nickname = "방장"
export const gameDataTable = "GameData/";
export const secondNickname = "유저2";
export const thirdNickname = "유저3";