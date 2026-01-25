class GameData {
  playerList = [];
  playSequence = [];
  startPlaySequence = [];
  suspect = "";
  nickname = "";
  category = "";
  correct = "";

  constructor(){
    this.nickname = localStorage.getItem('userNickname') || "";
  }

  myTurn() {
    return this.playSequence[0] === this.nickname;
  }

}

const gameData = new GameData;

export default gameData;