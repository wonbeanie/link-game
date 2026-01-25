class GameData {
  playSequence = [];
  startPlaySequence = [];

  myTurn(nickname) {
    return playSequence[0] === nickname;
  }


}

const gameData = new GameData;

export default gameData;