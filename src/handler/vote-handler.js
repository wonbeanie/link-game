import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import gameElements from "../modules/game-elements.js";
import { TABLE_KEYS, timer } from "../modules/modules.js";
import gameHandler from "./game-handler.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";
import gameManager from "../modules/game-manager.js";

class VoteHandler {
  playerSelectCheck = {};
  selectTimeout = false;
  sendSuspectCheck = false;
  VOTE_TIME = 60;
  SUSEPCT_ANSWER_TIME = 60;
  sendCheck = false;

  constructor(){
    eventBus.on(GameEvents.VOTE_START, ()=>this.init());
    eventBus.on(GameEvents.READY_TO_VOTE_END, (data)=>this.votesEnd(data));
    eventBus.on(GameEvents.TIE_OF_VOTES, ()=> this.init());
    eventBus.on(GameEvents.VOTE_UPDATE, (data)=>this.votes(data));
    eventBus.on(GameEvents.INIT_GAME_UI, ()=>timer.stopTimer());
    eventBus.on(GameEvents.VOTE_SKIP, () => this.processVoteSkip());
  }

  init(){
    this.playerSelectCheck = {};
    this.sendSuspectCheck = false;
    
    timer.startTimer(this.VOTE_TIME,()=>{
      this.selectTimeout = true;
      this.send();
    });
  
    this.selectTimeout = false;
    this.getVoteTransitionData();
    eventBus.emit(GameEvents.TURN_START_VOTE);
  }

  getVoteTransitionData(){
    const newDatabase = {
      [TABLE_KEYS.RE_SELECT_CULPRIT] : null,
      [TABLE_KEYS.SEQUENCE] : null,
      [TABLE_KEYS.SELECT_TIMEOUT] : null
    };

    gameDatabase.updateData(newDatabase);
  }

  send = () => {
    const {nickname} = gameStore;
    const {selectTimeout, sendSuspectCheck, playerSelectCheck} = this;

    const isPossibleVote = !selectTimeout || (!sendSuspectCheck && !playerSelectCheck[nickname]);
    
    const newDatabase = {
      [TABLE_KEYS.VOTE_LIST] : {
        ...(isPossibleVote && { [nickname] : gameElements.vote.value })
      },
      ...(selectTimeout && { [TABLE_KEYS.SELECT_TIMEOUT] : true }),
    }

    if(Object.keys(newDatabase).length > 0){
      this.sendCheck = true;
      gameDatabase.updateData(newDatabase);

      if(isPossibleVote){
        this.sendSuspectCheck = true;
      }
    }
  }

  calculateResult = () => {
    let selectList = {};

    for (const value of Object.values(this.playerSelectCheck)){
      const selectSuspect = value;
      if(!selectList[selectSuspect]){
        selectList[selectSuspect] = 0;
      }
      selectList[selectSuspect] += 1;
    }

    let maxSuspect = {
      suspect: "",
      count: 0
    };

    let sameList = [];

    for(const [suspect, count] of Object.entries(selectList)){
      if(count > maxSuspect.count){
        maxSuspect.suspect = suspect;
        maxSuspect.count = count;
        sameList = [suspect];
      }
      else if(count === maxSuspect.count){
        sameList.push(suspect);
      }
    }
    
    const isReVote = sameList.length > 1;
    const resetVoteData = isReVote ? {
      [TABLE_KEYS.RE_SELECT_CULPRIT] : sameList,
      [TABLE_KEYS.VOTE_LIST] : null,
      [TABLE_KEYS.VOTE_SKIP_LIST] : null,
    }
    : {};

    const newDatabase = isReVote
      ? resetVoteData
      : { [TABLE_KEYS.SELECT_CULPRIT] : maxSuspect.suspect }

    gameDatabase.updateData(newDatabase);
  }

  votesEnd(selectedSuspect){
    const {suspect, isSuspect, gameInfo} = gameStore;
    const failFindSuspect = suspect !== selectedSuspect;
    if(failFindSuspect){
      eventBus.emit(GameEvents.GAME_OVER, {
        gameInfo,
        data : null,
        findSuspect : false
      });
      return;
    }

    timer.stopTimer();

    eventBus.emit(GameEvents.TURN_END_VOTE);

    if(isSuspect){
      eventBus.emit(GameEvents.SET_LAST_ANSWER, selectedSuspect);
      timer.startTimer(this.SUSEPCT_ANSWER_TIME, gameHandler.sendLastAnswer);
    }
    else {
      timer.startTimer(this.SUSEPCT_ANSWER_TIME);
    }
  }

  votes(newData){
    this.playerSelectCheck = newData[TABLE_KEYS.VOTE_LIST];

    if(TABLE_KEYS.SELECT_TIMEOUT in newData){
      if(Object.keys(this.playerSelectCheck).length === gameStore.playerList.length && gameStore.admin){
        this.calculateResult();
      }
    }
  }

  processVoteSkip = () => {
    timer.stopTimer();
    
    if(gameStore.admin){
      this.calculateResult();
    }
  }

  skip = () => {
    if(!this.sendCheck){
      eventBus.emit(GameEvents.NOT_VOTE_SKIP);
      return;
    }

    const {nickname} = gameStore;
    const newDatabase = {
      [TABLE_KEYS.VOTE_SKIP_LIST] : {
        [nickname] : true
      }
    }

    let resend = true;
    if(gameManager.countVoteSkip + 1 === gameStore.startPlaySequence.length){
      resend = false;
    }

    gameDatabase.updateData(newDatabase, "GameData/", resend);
  }
}

const voteHandler = new VoteHandler();
export default voteHandler;