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

  setDefaultGameInfos(newDatabase){
    this.correct = newDatabase[TABLE_KEYS.CORRECT];
    this.fakeCorrect = newDatabase[TABLE_KEYS.FAKE_CORRECT];
    this.category = newDatabase[TABLE_KEYS.CATEGORY];
    this.suspect = newDatabase[TABLE_KEYS.SUSPECT];
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