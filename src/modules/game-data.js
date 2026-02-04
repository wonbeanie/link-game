import adminHandler from "../handler/admin-handler.js";
import uiHandler from "../handler/ui-handler.js";
import gameElements from "./game-elements.js";
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
  lastAnswer = "";

  constructor(){
    this.nickname = localStorage.getItem('userNickname') || "";
    uiHandler.updateNicknameUI(this.nickname);

    adminHandler.setAdmin();
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
    uiHandler.updateNicknameUI(nickname);
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

  get isDefaultGameInfo(){
    return this.correct && this.fakeCorrect && this.category && this.suspect;
  }
}

const gameData = new GameData;

export default gameData;