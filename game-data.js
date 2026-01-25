class GameData {
  playerList = [];
  playSequence = [];
  startPlaySequence = [];

  myTurn(nickname) {
    return this.playSequence[0] === nickname;
  }

}

const gameData = new GameData;

export default gameData;