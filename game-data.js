import gameElements from "./Game-Elements.js";
import { TABLE_KEYS } from "./modules.js";

class GameData {
  playerList = [];
  playSequence = [];
  startPlaySequence = [];
  suspect = "";
  nickname = "";
  category = "";
  correct = "";
  state = "";
  admin = false;
  playerSelectCheck = [];
  selectTimeout = false;
  sendSuspectCheck = false;
  lastAnswer = "";

  constructor(){
    this.nickname = localStorage.getItem('userNickname') || "";
    gameElements.nickname.value = this.nickname;

    this.checkAdmin();
  }

  checkAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    this.admin = Boolean(urlParams.get('admin')) || false;
    
    if(this.admin){
      gameElements.admin.display.show();
    }
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
    this.nickname = nickname;
    localStorage.setItem('userNickname', nickname);
    gameElements.nickname.value = this.nickname;
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