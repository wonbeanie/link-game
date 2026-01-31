import { correctList } from "./keywords.js";
import { pickRandom, shuffleStrings, alert, logger, timer, TABLE_KEYS, DATABASE_KEYS } from "./modules.js";
import gameDatabase from "./database.js";
import gameData from "./game-data.js";
import chatHandler from "./chat-handler.js";
import gameElements from "./Game-Elements.js";
import hintHandler from "./hint-handler.js";
import gameHandler from "./game-handler.js";
import voteHandler from "./vote-handler.js";

gameElements.nickname.btn.addEventListener("click", (e) => {
  let result = {};
  result[gameElements.nickname.value] = "Ready";
  gameDatabase.updateData(result);

  gameData.nickname = gameElements.nickname.value;
  gameElements.info.nickname.textContent = gameData.nickname;
});

gameDatabase.onValueListener(DATABASE_KEYS.CHAT_DATA_KEY, (data) => {
  chatHandler.settingChatHistory(data);
})

gameDatabase.onValueListener(DATABASE_KEYS.GAME_DATA_KEY, (data) => {
  gameSetting(data);

  logger.clearLog();

  logSetting(data);
});

function logSetting(data){
  const { startPlaySequence } = gameData;
  let playerHints = {};

  let votingList = {};

  const startPlaySequenceString = startPlaySequence.join(",");

  Object.entries(data).forEach(([key, value]) => {
    if(startPlaySequenceString.includes(key) || gameData.state === ""){
      playerHints[key] = value;

      if(startPlaySequence.length === 0){
        logger.setLog(key, value);
      }
      return;
    }

    if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
      votingList[key.split("-")[1]] = value;
      return;
    }

    if(key.includes(TABLE_KEYS.CHAT_HISTORY)){
      chatHandler.chatHistory = value;
      return;
    }
  });

  activityLog({
    playerHints,
    votingList
  });
}

function activityLog({playerHints,votingList}){
  votingLog(votingList);

  hintLog(playerHints);
}

function votingLog(votingList){
  if(gameData.state !== ""){
    logger.setLog(`투표`, '---------------');
  }

  Object.keys(votingList).forEach((player)=>{
    logger.setLog(`${player}`, `${votingList[player]}님을 투표하였습니다.`);
  });
}

function hintLog(playerHints){
  if(gameData.state !== ""){
    logger.setLog(`힌트`, '---------------');
  }

  gameData.startPlaySequence.forEach((player)=>{
    if(!playerHints[player]){
      return;
    }
    
    logger.setLog(player, playerHints[player]);
  });
}

function gameStartInit(){
  chatHandler.chatStart();
  gameData.state = TABLE_KEYS.START;
  reloadEvent();

  const result = {};
  result[TABLE_KEYS.START] = null;
  return result;
}

function gameHintSequence(data){
  if(data === "end"){
    gameData.playerList = gameData.startPlaySequence;
    voteHandler.setSuspectVoteList(gameData.startPlaySequence);
    alert.show("토론시간", "1분의 토론시간이 주어집니다.");
    gameElements.vote.show();
    gameElements.hint.hide();

    return voteHandler.init();
  }

  hintHandler.turnProcessor(data);
  if(gameData.state === TABLE_KEYS.START){
    gameHandler.startGame();
  }
}

function tieOfVotes(data){
  alert.show("투표 동점", `${data.join(",")}중에 한명을 선택해주세요.`);
  voteHandler.setSuspectVoteList(data);
  return voteHandler.init();
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
    timer.startTimer(SUSEPCT_ANSWER_TIME, sendLastAnswer);
  }
  else {
    alert.show("범인을 찾았습니다.", "범인이 답을 입력하고 있습니다.");
    timer.startTimer(SUSEPCT_ANSWER_TIME);
  }
}

function gameSetting(snapshot){
  let updateDatabase = {};
  voteHandler.playerSelectCheck = [];

  gameData.setDefaultGameInfos(snapshot);

  if(TABLE_KEYS.SEQUENCE in snapshot){
    const data = snapshot[TABLE_KEYS.SEQUENCE];
    const newDatabase = gameHintSequence(data);

    updateDatabase = {
      ...updateDatabase,
      ...newDatabase
    };
  }

  if(TABLE_KEYS.LAST_ANSWER in snapshot){
    const data = snapshot[TABLE_KEYS.LAST_ANSWER];
    gameOver(data, true);
    return;
  }

  if(TABLE_KEYS.SELECT_CULPRIT in snapshot){
    const data = snapshot[TABLE_KEYS.SELECT_CULPRIT];
    votesEnd(data);
  }

  if(TABLE_KEYS.START in snapshot){
    const newDatabase = gameStartInit();

    updateDatabase = {
      ...updateDatabase,
      ...newDatabase
    };
  }

  if(TABLE_KEYS.RE_SELECT_CULPRIT in snapshot){
    const data = snapshot[TABLE_KEYS.RE_SELECT_CULPRIT];
    const newDatabase = tieOfVotes(data);

    updateDatabase = {
      ...updateDatabase,
      ...newDatabase
    }
  }

  const newDatabase = votes(snapshot);

  updateDatabase = {
    ...updateDatabase,
    ...newDatabase
  }

  if(TABLE_KEYS.OUT_GAME in snapshot){
    outGame();
  }

  if(Object.keys(updateDatabase).length > 0){
    gameDatabase.updateData(updateDatabase); 
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
      return selectCulprit();
    }
  }

  return {};
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

  return result;
}

function gameInit(){
  const category = pickRandom(Object.keys(correctList));
  const correct = pickRandom(correctList[category]);

  let noCorrectList = [];

  correctList[category].forEach((data)=>{
    if(correct === data){
      return;
    }
    noCorrectList.push(data);
  });

  const fakeCorrect = pickRandom(noCorrectList);

  let result = {};

  result[TABLE_KEYS.CATEGORY] = category;
  result[TABLE_KEYS.CORRECT] = correct;
  result[TABLE_KEYS.FAKE_CORRECT] = fakeCorrect;

  gameData.category = category;
  gameData.correct = correct;
  gameData.fakeCorrect = fakeCorrect;

  return result;
}

gameElements.admin.start.addEventListener("click",()=>{
  gameDatabase.getData(DATABASE_KEYS.GAME_DATA_KEY).then((data) => {
    let list = [];

    if(!data){
      return;
    }

    Object.entries(data).forEach(([key, value]) => {
      if(key === TABLE_KEYS.START){
        return;
      }

      list.push(key);
    });

    let result = gameInit();

    const shuffleList = shuffleStrings(list);

    gameData.suspect = pickRandom(shuffleList);

    const {suspect, category, fakeCorrect, isSuspect, correct} = gameData;
    result[TABLE_KEYS.SEQUENCE] = shuffleList;
    result[TABLE_KEYS.SUSPECT] = suspect;

    gameElements.info.category.textContent = category;
    
    if(isSuspect){
      gameElements.info.correct.textContent = fakeCorrect;
    }
    else {
      gameElements.info.correct.textContent = correct;
    }

    gameDatabase.updateData(result);
  });

  gameDatabase.clearDatabase();
  let result = {};
  result[TABLE_KEYS.START] = `Start Game${new Date().getTime()}`
  gameDatabase.updateData(result);
});


gameElements.admin.clear.addEventListener("click",()=>{
  gameDatabase.clearDatabase();
});


gameElements.hint.btn.addEventListener("click", hintHandler.send);

gameElements.answer.btn.addEventListener("click",sendLastAnswer);

function sendLastAnswer(){
  if(gameData.lastAnswer === gameData.nickname){
    let result = {};
    result[TABLE_KEYS.LAST_ANSWER] = gameElements.answer.value;
    result[TABLE_KEYS.SELECT_CULPRIT] = "";
    gameDatabase.updateData(result);
  }
}

gameElements.vote.btn.addEventListener("click",voteHandler.send);

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