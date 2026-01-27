import { TABLE_KEYS } from "./database.js";

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

  get myTurn() {
    return this.playSequence[0] === this.nickname;
  }

  set nickname(nickname){
    this.nickname = nickname
    localStorage.setItem('userNickname', nickname);
  }

  get isSuspect(){
    return this.suspect === this.nickname;
  }

  get myCorrect(){
    const {isSuspect, fakeCorrect, correct} = this;
    return isSuspect ? fakeCorrect : correct;
  }

  get myVotingKey(){
    return `${TABLE_KEYS.SUSPECT_LIST}-${this.nickname}`;
  }
}

const gameData = new GameData;

export default gameData;