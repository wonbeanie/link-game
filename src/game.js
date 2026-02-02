import { correctList } from "./modules/keywords.js";
import { pickRandom, shuffleStrings, alert, timer, TABLE_KEYS, DATABASE_KEYS, SEQUENCE_END } from "./modules/modules.js";
import gameDatabase from "./database/database.js";
import gameData from "./modules/game-data.js";
import gameElements from "./modules/game-elements.js";
import {adminHandler, chatHandler, gameHandler, hintHandler, messageHandler, voteHandler} from "./handler/index.js";

gameDatabase.onValueListener(DATABASE_KEYS.CHAT_DATA_KEY, (data) => {
  chatHandler.settingChatHistory(data);
})

gameDatabase.onValueListener(DATABASE_KEYS.GAME_DATA_KEY, (newData) => {
  gameHandler.newDatabase = newData;

  if(gameHandler.isLastAnswerTurn){
    const data = newData[TABLE_KEYS.LAST_ANSWER];
    gameOver(data, true);
    return;
  }

  if(gameHandler.isPlayerOut){
    outGame();
    return;
  }

  gameSetting(newData);

  messageHandler.setMessages(newData);
  messageHandler.logView();
});

function gameSetting(snapshot){
  voteHandler.playerSelectCheck = [];

  if(!gameData.isDefaultGameInfo){
    gameData.setDefaultGameInfos(snapshot);
  }

  if(gameHandler.isInitSetting){
    gameStartInit();
    return;
  }

  if(gameHandler.isHintTurn){
    const data = snapshot[TABLE_KEYS.SEQUENCE];
    routeGameFlow(data);
    return;
  }

  if(gameHandler.isVoteEnd){
    const data = snapshot[TABLE_KEYS.SELECT_CULPRIT];
    votesEnd(data);
    return;
  }

  if(gameHandler.isTieOfVotes){
    const data = snapshot[TABLE_KEYS.RE_SELECT_CULPRIT];
    tieOfVotes(data);
    return;
  }

  votes(snapshot);
}

function gameStartInit(){
  chatHandler.chatStart();
  gameData.state = TABLE_KEYS.START;
  reloadEvent();

  const result = {};
  result[TABLE_KEYS.START] = null;
  gameDatabase.updateData(result); 
}

function routeGameFlow(data){
  if(data === SEQUENCE_END){
    voteHandler.voteStart();
    return;
  }

  hintHandler.turnProcessor(data);

  if(gameData.state === TABLE_KEYS.START){
    gameHandler.startGame();
  }

  return {};
}

function tieOfVotes(data){
  alert.show("투표 동점", `${data.join(",")}중에 한명을 선택해주세요.`);
  voteHandler.setSuspectVoteList(data);
  voteHandler.init();
}

function gameOver(data, findSusepct = false){
  const {correct, fakeCorrect, suspect} = gameData;
  if(findSusepct){
    if(correct === data){
      alert.show("범인 승리", `범인이 정답(${data})을 맞췄습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
    }
    else {
      alert.show("시민 승리",`범인의 최종 답은 ${data}으로 답하였습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
    }
  }
  else {
    if(suspect !== data){
      alert.show("범인이 아닙니다.", `범인은 ${suspect}였습니다.`);
    }
  }

  timer.stopTimer();
  reloadEvent();
  chatHandler.chatClose();
}

function votesEnd(data){
  const {suspect, isSuspect} = gameData;
  const failFindSuspect = suspect !== data;
  if(failFindSuspect){
    gameOver(data);
    return;
  }

  gameElements.vote.hide();

  timer.stopTimer();

  const SUSEPCT_ANSWER_TIME = 60;

  if(isSuspect){
    alert.show("범인인것을 걸렸습니다.", "정답을 맞춰주세요.");
    gameData.lastAnswer = data;
    gameElements.hint.hide();
    gameElements.answer.show();
    timer.startTimer(SUSEPCT_ANSWER_TIME, gameHandler.sendLastAnswer);
  }
  else {
    alert.show("범인을 찾았습니다.", "범인이 답을 입력하고 있습니다.");
    timer.startTimer(SUSEPCT_ANSWER_TIME);
  }
}

function outGame(){
  alert.show("알림","플레이어중 한명이 나갔습니다.\n게임을 초기화합니다.");
  gameDatabase.clearDatabase();
  removeReloadEvent();
  alert.restart = true;
}

function votes(snapshot){
  Object.keys(snapshot).forEach((key)=>{
    if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
      voteHandler.playerSelectCheck[key.split("-")[1]] = snapshot[key];
    }
  });

  if(TABLE_KEYS.SELECT_TIMEOUT in snapshot){
    if(Object.keys(voteHandler.playerSelectCheck).length === gameData.playerList.length && gameData.admin){
      selectCulprit();
    }
  }
}

function selectCulprit(){
  let selectList = {

  };

  Object.keys(voteHandler.playerSelectCheck).forEach((key)=>{
    const selectSuspect = voteHandler.playerSelectCheck[key];
    if(!selectList[selectSuspect]){
      selectList[selectSuspect] = 0;
    }
    selectList[selectSuspect] += 1;
  });

  let maxSuspect = {
    suspect: "",
    count: 0
  };

  let sameList = [];

  Object.keys(selectList).forEach((suspect)=>{
    if(selectList[suspect] > maxSuspect.count){
      maxSuspect.suspect = suspect;
      maxSuspect.count = selectList[suspect];
      sameList = [suspect];
    }
    else if(selectList[suspect] === maxSuspect.count){
      sameList.push(suspect);
    }
  });

  let result = {};

  if(sameList.length > 1){
    result[TABLE_KEYS.RE_SELECT_CULPRIT] = sameList;

    gameData.playerList.forEach((player)=>{
      result[`${TABLE_KEYS.SUSPECT_LIST}-${player}`] = null;
    });
  }
  else {
    result[TABLE_KEYS.SELECT_CULPRIT] = maxSuspect.suspect;
  }

  gameDatabase.updateData(result);
}

gameElements.admin.start.addEventListener("click",adminHandler.start);
gameElements.admin.clear.addEventListener("click",adminHandler.clear);
gameElements.hint.btn.addEventListener("click", hintHandler.send);
gameElements.answer.btn.addEventListener("click",gameHandler.sendLastAnswer);
gameElements.vote.btn.addEventListener("click",voteHandler.send);
gameElements.nickname.btn.addEventListener("click", gameHandler.sendNickname);

function reloadEvent(){
  removeReloadEvent();
  window.addEventListener('beforeunload', outGameEvent);
}

function removeReloadEvent(){
  window.removeEventListener('beforeunload', outGameEvent);
}

function outGameEvent(e){
  if(gameData.state !== ""){
    let result = {};
    result[TABLE_KEYS.OUT_GAME] = true;
    gameDatabase.updateData(result);
  }
}