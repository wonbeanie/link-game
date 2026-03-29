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
  startChat = false;

  constructor(){
    eventBus.on(GameEvents.GAME_INFOS_UPDATE, (data) => this.updateGameInfos(data));
    eventBus.on(GameEvents.SET_CHAT_HISTORY, (newChatHistory) => this.chatHistory = newChatHistory);
    eventBus.on(GameEvents.REQUEST_CHANGE_NICKNAME, (nickname) => this.changeNickname(nickname));
    eventBus.on(GameEvents.INIT_HINT, (data) => this.initHint(data));
    eventBus.on(GameEvents.SET_PLAY_SEQUENCE, (playerList) => this.playSequence = playerList);
    eventBus.on(GameEvents.SET_LAST_ANSWER, (lastAnswer) => this.lastAnswer = lastAnswer);
    eventBus.on(GameEvents.CHANGE_START, () => this.state = GAME_STATE.PLAYING);
    eventBus.on(GameEvents.INIT_NICKNAME, () => this.initNickname());
    eventBus.on(GameEvents.INIT_GAME_UI, () => this.initGame());
    eventBus.on(GameEvents.CREATE_ROOM, () => this.setAdmin());
    eventBus.on(GameEvents.RELESE_ROOM, () => this.admin = false);
  }

  initGame(){
    this.playerList = [];
    this.playSequence = [];
    this.startPlaySequence = [];
    this.suspect = "";
    this.category = "";
    this.correct = "";
    this.state = "";
    this.lastAnswer = "";
    this.chatHistory = [];
    this.startChat = false;
  }

  setAdmin() {
    this.admin = true;
    eventBus.emit(GameEvents.DONE_SET_ADMIN);
  }

  initHint(playerList){
    this.startPlaySequence = playerList;
    this.playerList = playerList;
  }

  updateGameInfos(newDatabase){
    this.setDefaultGameInfos(newDatabase);
    this.state = GAME_STATE.START;
  }

  initNickname = () => {
    this.nickname = localStorage.getItem('userNickname') || "";
    eventBus.emit(GameEvents.REQUEST_CHANGE_NICKNAME, this.nickname);
  }

  changeNickname(nickname){
    this.nickname= nickname;
    localStorage.setItem('userNickname', nickname);
  }

  setDefaultGameInfos(newDatabase){
    this.correct = newDatabase[TABLE_KEYS.CORRECT];
    this.fakeCorrect = newDatabase[TABLE_KEYS.FAKE_CORRECT];
    this.category = newDatabase[TABLE_KEYS.CATEGORY];
    this.suspect = newDatabase[TABLE_KEYS.SUSPECT];

    eventBus.emit(GameEvents.DEFAULT_GAME_INFO_UPDATED,{
      category : this.category,
      correct : this.myCorrect
    })
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

  get isDefaultGameInfo(){
    return this.correct && this.fakeCorrect && this.category && this.suspect;
  }

  get isLastAnswerTurn(){
    return this.lastAnswer === this.nickname;
  }

  get gameInfo() {
    return {
      correct : this.correct,
      fakeCorrect : this.fakeCorrect,
      suspect : this.suspect
    };
  }
}

const gameStore = new GameStore;

export default gameStore;