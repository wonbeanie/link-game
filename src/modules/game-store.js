import adminHandler from "../handler/admin-handler.js";
import uiHandler from "../handler/ui-handler.js";
import eventBus from "./event-bus.js";
import { GameEvents } from "./events.js";
import { GAME_STATE, TABLE_KEYS } from "./modules.js";

class GameStore {
  playerList = [];
  playSequence = [];
  startPlaySequence = [];
  suspect = "";
  nickname = "";
  category = "";
  correct = "";
  state = "";
  lastAnswer = "";
  admin = false;
  chatHistory = [];

  constructor(){
    this.nickname = localStorage.getItem('userNickname') || "";
    uiHandler.updateNicknameUI(this.nickname);

    this.admin = adminHandler.setAdmin();

    eventBus.on(GameEvents.GAME_INFOS_UPDATE, (newDatabase) => {
      this.setDefaultGameInfos(newDatabase);
      this.state = GAME_STATE.START;
    });
    eventBus.on(GameEvents.SET_CHAT_HISTORY, (newChatHistory) => this.chatHistory = newChatHistory);
    eventBus.on(GameEvents.REQUEST_CHANGE_NICKNAME, (nickname) => this.changeNickname(nickname));
    eventBus.on(GameEvents.SET_PLAYER_LIST, (playerList) => {
      this.startPlaySequence = playerList;
      this.playerList = playerList;
    });
    eventBus.on(GameEvents.SET_PLAY_SEQUENCE, (playerList) => this.playSequence = playerList);
    eventBus.on(GameEvents.SET_STATE, (state) => this.state = state);
    eventBus.on(GameEvents.SET_LAST_ANSWER, (lastAnswer)=>this.lastAnswer = lastAnswer);
  }

  changeNickname(nickname){
    this.nickname= nickname;
    localStorage.setItem('userNickname', nickname);
    uiHandler.updateNicknameUI(nickname);
  }

  setDefaultGameInfos(newDatabase){
    this.correct = newDatabase[TABLE_KEYS.CORRECT];
    this.fakeCorrect = newDatabase[TABLE_KEYS.FAKE_CORRECT];
    this.category = newDatabase[TABLE_KEYS.CATEGORY];
    this.suspect = newDatabase[TABLE_KEYS.SUSPECT];
    uiHandler.updateGameInfoUI(this.category, this.myCorrect);
  }

  get myTurn() {
    return this.playSequence[0] === this.nickname;
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

  get isLastAnswerTurn(){
    return this.lastAnswer === this.nickname;
  }
}

const gameStore = new GameStore;

export default gameStore;