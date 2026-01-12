import { correctList } from "./keywords.js";
import { Chat, pickRandom, shuffleStrings, Alert, Log, Timer } from "./modules.js";
import GameDatabase, { TABLE_KEYS } from "./database.js";

const { chatStart, chatClear, addChatMessage, chatClose } = Chat(sendClick);
const { showAlert } = Alert(closeClick);
const { setLog, clearLog } = Log();
const { startTimer, stopTimer} = Timer();
const { clearDatabase, KEY, onValueListener, updateData, getData } = GameDatabase();

const nicknameField = document.getElementById('nickname');
const nicknameInputField = document.getElementById('nickname-input');
const confirmField = document.getElementById("confirm");
const startField = document.getElementById("start");
const clearField = document.getElementById("clear");
const hintFiled = document.getElementById("hint");
const hintBtnField = document.getElementById("hint-btn");
const playerSelectField = document.getElementById("player-select");
const sespectInputField = document.getElementById("sespect-input");
const answerBtnField = document.getElementById("answer-btn");
const answerField = document.getElementById("answer");
const selectPlayerField = document.getElementById("player-list");
const categoryField = document.getElementById("category");
const correctField = document.getElementById("correct");
const stateInfoField = document.getElementById("state-info");

const urlParams = new URLSearchParams(window.location.search);
const admin = Boolean(urlParams.get('admin')) || false;

let playerList = [];

let suspect = "";

let playSequence = [];

let playerSelectCheck = [];

let nickname = localStorage.getItem('userNickname') || "";
nicknameInputField.value = nickname

let sameList = [];

let lastAnswer = "";
let selectTimeout = false;

let category = "";
let correct = "";
let fakeCorrect = "";

let gameState = "";

let chatHistory = [];

confirmField.addEventListener("click", (e) => {
  let result = {};
  result[nicknameInputField.value] = "Ready";
  updateData(result);

  nickname = nicknameInputField.value;
  document.getElementById("nickname-info").textContent = nickname;

  localStorage.setItem('userNickname', nickname);
});

const hintInputField = document.getElementById('hint-input');
const answerInputField = document.getElementById('answer-input');

let startPlaySequence = [];

let restart = false;

if(admin){
  document.getElementById('admin-btn').className = "show";
}

onValueListener(KEY.CHAT_DATA_KEY, (data) => {
  chatHistory = data[TABLE_KEYS.CHAT_HISTORY];
  chatClear();
  chatHistory.forEach((chat)=>{
    addChatMessage(chat.nickname, chat.message);
  });
})

onValueListener(KEY.GAME_DATA_KEY, (data) => {
  gameSetting(data);

  clearLog();

  logSetting(data);
});

function logSetting(data){
  let playerHints = {};

  let votingList = {};

  const startPlaySequenceString = startPlaySequence.join(",");

  Object.entries(data).forEach(([key, value]) => {
    if(startPlaySequenceString.includes(key) || gameState === ""){
      playerHints[key] = value;

      if(startPlaySequence.length === 0){
        setLog(key, value);
      }
      return;
    }

    if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
      votingList[key.split("-")[1]] = value;
      return;
    }

    if(key.includes(TABLE_KEYS.CHAT_HISTORY)){
      chatHistory = value;
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
  if(gameState !== ""){
    setLog(`투표`, '---------------');
  }

  Object.keys(votingList).forEach((player)=>{
    setLog(`${player}`, `${votingList[player]}님을 투표하였습니다.`);
  });
}

function hintLog(playerHints){
  if(gameState !== ""){
    setLog(`힌트`, '---------------');
  }

  startPlaySequence.forEach((player)=>{
    if(!playerHints[player]){
      return;
    }
    
    setLog(player, playerHints[player]);
  });
}

function gameStartInit(){
  chatStart();
  gameState = TABLE_KEYS.START;
  let result = {};
  result[TABLE_KEYS.START] = null;
  updateData(result);
  reloadEvent();
}

function gameHintSequence(data){
  if(data === "end"){
    showAlert("토론시간", "1분의 토론시간이 주어집니다.");
    votesInit();

    selectPlayerField.className = "show";
    hintFiled.className = "none";
    return;
  }

  const notSettingPlayList = playerList.length === 0;
  if(notSettingPlayList) {
    setPlayerList(data);
    nicknameField.className = "none";
    startPlaySequence = data;
  }

  playSequence = data;

  startGame();
}

function tieOfVotes(data){
  showAlert("투표 동점", `${data.join(",")}중에 한명을 선택해주세요.`);
  setPlayerList(data);
  votesInit();
}

function votesInit(){
  const VOTE_TIME = 5;
  startTimer(VOTE_TIME,()=>{
    selectTimeout = true;
    sendSusepct();
  });

  let result = {};
  result[TABLE_KEYS.RE_SELECT_CULPRIT] = null;
  result[TABLE_KEYS.SEQUENCE] = null;
  result[TABLE_KEYS.SELECT_TIMEOUT] = null;
  selectTimeout = false;
  updateData(result);
}

function gameOver(data, findSusepct = false){
  if(findSusepct){
    if(correct === data){
      showAlert("범인 승리", `범인이 정답(${data})을 맞췄습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
    }
    else {
      showAlert("시민 승리",`범인의 최종 답은 ${data}으로 답하였습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
    }
  }
  else {
    if(suspect !== data){
      showAlert("범인이 아닙니다.", `범인은 ${suspect}였습니다.`);
    }
  }

  stopTimer();
  reloadEvent();
  chatClose();
}

function votesEnd(data){
  const failFindSuspect = suspect !== data;
  if(failFindSuspect){
    gameOver(data);
    return;
  }

  selectPlayerField.className = "none";
  stopTimer();

  const suspectPlayer = suspect === nickname;
  const SUSEPCT_ANSWER_TIME = 60;

  if(suspectPlayer){
    showAlert("범인인것을 걸렸습니다.", "정답을 맞춰주세요.");
    lastAnswer = data;
    hintBtnField.className = "none";
    answerField.className = "show";
    startTimer(SUSEPCT_ANSWER_TIME, sendLastAnswer);
  }
  else {
    showAlert("범인을 찾았습니다.", "범인이 답을 입력하고 있습니다.");
    startTimer(SUSEPCT_ANSWER_TIME);
  }
}

function gameSetting(snapshot){
  playerSelectCheck = [];

  correct = snapshot[TABLE_KEYS.CORRECT];
  fakeCorrect = snapshot[TABLE_KEYS.FAKE_CORRECT];
  category = snapshot[TABLE_KEYS.CATEGORY];
  suspect = snapshot[TABLE_KEYS.SUSPECT];

  if(TABLE_KEYS.START in snapshot){
    gameStartInit();
  }

  if(TABLE_KEYS.SEQUENCE in snapshot){
    const data = snapshot[TABLE_KEYS.SEQUENCE];
    gameHintSequence(data);
  }

  if(TABLE_KEYS.RE_SELECT_CULPRIT in snapshot){
    const data = snapshot[TABLE_KEYS.RE_SELECT_CULPRIT];
    tieOfVotes(data);
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

  votes(snapshot);

  if(TABLE_KEYS.OUT_GAME in snapshot){
    outGame();
  }
}

function outGame(){
  showAlert("알림","플레이어중 한명이 나갔습니다.\n게임을 초기화합니다.");
  clearDatabase();
  removeReloadEvent();
  restart = true;
}

function votes(snapshot){
  Object.keys(snapshot).forEach((key)=>{
    if(key.includes(TABLE_KEYS.SUSPECT_LIST)){
      playerSelectCheck[key.split("-")[1]] = snapshot[key];
    }
  });

  if(TABLE_KEYS.SELECT_TIMEOUT in snapshot){
    if(Object.keys(playerSelectCheck).length === playerList.length && admin){
      selectCulprit();
    }
  }
}

function selectCulprit(){
  let selectList = {

  };

  Object.keys(playerSelectCheck).forEach((key)=>{
    const selectSuspect = playerSelectCheck[key];
    if(!selectList[selectSuspect]){
      selectList[selectSuspect] = 0;
    }
    selectList[selectSuspect] += 1;
  });

  let maxSuspect = {
    suspect: "",
    count: 0
  };

  sameList = [];

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

    playerList.forEach((player)=>{
      result[`${TABLE_KEYS.SUSPECT_LIST}-${player}`] = null;
    });
  }
  else {
    result[TABLE_KEYS.SELECT_CULPRIT] = maxSuspect.suspect;
  }

  updateData(result);
}

function gameInit(){
  category = pickRandom(Object.keys(correctList));

  correct = pickRandom(correctList[category]);

  let noCorrectList = [];

  correctList[category].forEach((data)=>{
    if(correct === data){
      return;
    }
    noCorrectList.push(data);
  });

  fakeCorrect = pickRandom(noCorrectList);

  let result = {};

  result[TABLE_KEYS.CATEGORY] = category;
  result[TABLE_KEYS.CORRECT] = correct;
  result[TABLE_KEYS.FAKE_CORRECT] = fakeCorrect;

  return result;
}

startField.addEventListener("click",()=>{
  getData(KEY.GAME_DATA_KEY).then((data) => {
    let list = [];

    Object.entries(data).forEach(([key, value]) => {
      if(key === TABLE_KEYS.START){
        return;
      }

      list.push(key);
    });

    let result = gameInit();

    const shuffleList = shuffleStrings(list);

    suspect = pickRandom(shuffleList);

    result[TABLE_KEYS.SEQUENCE] = shuffleList;
    result[TABLE_KEYS.SUSPECT] = suspect;

    categoryField.textContent = category;
    
    if(nickname === suspect){
      correctField.textContent = fakeCorrect;
    }
    else {
      correctField.textContent = correct;
    }

    updateData(result);
  });

  clearDatabase();
  let result = {};
  result[TABLE_KEYS.START] = `Start Game${new Date().getTime()}`
  updateData(result);
});

clearField.addEventListener("click",()=>{
  clearDatabase();
});

hintBtnField.addEventListener("click", sendHint);

function sendHint(){
  if(myTurn()){
    stopTimer();
    let result = {};

    if(playSequence.length !== 1){
      result[TABLE_KEYS.SEQUENCE] = playSequence.slice(1, playSequence.length);
    }
    else {
      result[TABLE_KEYS.SEQUENCE] = "end";
      showAlert("토론시간", "1분의 토론시간이 주어집니다.");
      startTimer(60,sendSusepct);
      hintFiled.className = "none";
    }

    result[nickname] = hintInputField.value;

    hintFiled.className = "none";
    updateData(result);
  }
}

answerBtnField.addEventListener("click",sendLastAnswer);

function sendLastAnswer(){
  if(lastAnswer === nickname){
    let result = {};
    result[TABLE_KEYS.LAST_ANSWER] = answerInputField.value;
    result[TABLE_KEYS.SELECT_CULPRIT] = "";
    updateData(result);
  }
}

function setPlayerList(data){
  playerList = data;

  playerSelectField.textContent = "";


  
  JSON.parse(JSON.stringify(data)).sort().forEach((player)=>{
    const optionElement = document.createElement("option");
    optionElement.value = player;
    optionElement.textContent = player;

    playerSelectField.appendChild(optionElement);
  });
}

function startGame() {
  let correctTemp = nickname === suspect ? fakeCorrect : correct;

  categoryField.textContent = category;
  correctField.textContent = correctTemp;

  stateInfoField.textContent = `${playSequence[0]}님이 입력하고 있습니다.`;

  if(myTurn()){
    startTimer(30, sendHint);
    showAlert("당신 순서입니다.",`카테고리는 ${category}, 제시어는 ${correctTemp}입니다.`);
    gameState = "Playing";
    hintFiled.className = "show";
    return;
  }
  else {
    startTimer(30);
  }
  
  if(gameState === TABLE_KEYS.START){
    showAlert("게임시작", `카테고리는 ${category}, 제시어는 ${correctTemp}입니다.`);
    gameState = "Playing";
  }
}

function myTurn() {
  return playSequence[0] === nickname;
}

sespectInputField.addEventListener("click",sendSusepct);

function sendSusepct(){
  const selectSuspectKey = `${TABLE_KEYS.SUSPECT_LIST}-${nickname}`;
  let result = {};
  result[selectSuspectKey] = playerSelectField.value;

  if(selectTimeout){
    result[TABLE_KEYS.SELECT_TIMEOUT] = true;
  }

  updateData(result);
}

function reloadEvent(){
  removeReloadEvent();
  window.addEventListener('beforeunload', outGameEvent);
}

function removeReloadEvent(){
  window.removeEventListener('beforeunload', outGameEvent);
}

function outGameEvent(e){
  if(gameState !== ""){
    let result = {};
    result[TABLE_KEYS.OUT_GAME] = true;
    updateData(result);
  }
}

function sendClick(msg){
  if (msg) {
    let result = {};

    if(chatHistory.length >= 30){
      chatHistory.shift();
    }

    chatHistory.push({
      nickname : nickname,
      message : msg
    });

    result[TABLE_KEYS.CHAT_HISTORY] = chatHistory;

    updateData(result, KEY.CHAT_DATA_KEY);
  }
}

function closeClick(){
  if(restart){
    location.reload();
  }
}