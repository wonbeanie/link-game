import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get, child, update} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { correctList } from "./keywords.js";
import { firebaseConfig } from "./config.js";
import { Chat, pickRandom, shuffleStrings, Alert, Log } from "./modules.js";

const { chatStart, chatClear, addChatMessage, chatClose } = Chat(sendClick);
const { showAlert } = Alert(closeClick);
const { setLog, clearLog } = Log();

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(getDatabase());

const nicknameField = document.getElementById('nickname');
const nicknameInputField = document.getElementById('nickname-input');
const confirmField = document.getElementById("confirm");
const startField = document.getElementById("start");
const clearField = document.getElementById("clear");
const timerField = document.getElementById("timer");
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

let inteval = null;

let playSequence = [];

const startKey = "START";

const sequenceKey = "Sequence";

const suspectKey = "Suspect";

let suspectListKey = "SuspectList";

let playerSelectCheck = [];

const selectCulpritKey = "SelectCulprit";

let nickname = localStorage.getItem('userNickname') || "";
nicknameInputField.value = nickname

const reSelectCulpritKey = "ReSelectCulprit";

let sameList = [];

let lastAnswer = "";

const selectTimeoutKey = "SelectTimeout";
let selectTimeout = false;

let category = "";
let correct = "";
let fakeCorrect = "";

let gameState = "";

const categoryKey = "Category";
const correctKey = "Correct";
const fakeCorrectKey = "FakeCorrect";

const lastAnswerKey = "LastAnswer";
const lastAnswerRef = ref(db, lastAnswerKey);

const outGameKey = "OutGame";

const chatHistoryKey = "ChatHistory";
let chatHistory = [];

confirmField.addEventListener("click", (e) => {
  let result = {};
  result[nicknameInputField.value] = "Ready";
  updateData(result);

  nickname = nicknameInputField.value;
  document.getElementById("nickname-info").innerText = nickname;

  localStorage.setItem('userNickname', nickname);
});

const hintInputField = document.getElementById('hint-input');
const answerInputField = document.getElementById('answer-input');

let startPlaySequenceTemp = [];

let restart = false;

if(admin){
  document.getElementById('admin-btn').className = "show";
}

const gameDataKey = "GameData/";

const chatDataKey = "Chat/";

onValue(ref(db, chatDataKey), (snapshot) => {
  if(null === snapshot.val()){
    return;
  }

  let data = snapshot.val();

  chatHistory = data[chatHistoryKey];

  
  chatClear();
  chatHistory.forEach((chat)=>{
    addChatMessage(chat.nickname, chat.message);
  });
});

onValue(ref(db, gameDataKey), (snapshot) => {
  if(null === snapshot.val()){
    return;
  }

  let data = snapshot.val();

  gameSetting(data);

  clearLog();

  let playerHints = {};

  let votingList = {};

  snapshot.forEach((childSnapshot, i) => {
      const key = childSnapshot.key;
      const data = childSnapshot.val();

      if(key === correctKey){
        return;
      }

      if(key === fakeCorrectKey){
        return;
      }

      if(key === categoryKey){
        return;
      }

      if(key === lastAnswerRef){
        return;
      }

      if(key === startKey){
        return;
      }

      if(key === sequenceKey){
        return;
      }

      if(key === suspectKey){
        return;
      }

      if(key === reSelectCulpritKey){
        return;
      }

      if(key === selectCulpritKey){
        return;
      }

      if(key.includes(suspectListKey)){
        votingList[key.split("-")[1]] = data;
        return;
      }

      if(key === lastAnswerKey){
        return;
      }

      if(key === outGameKey){
        return;
      }
      
      if(key === selectTimeoutKey){
        return;
      }

      if(key.includes(chatHistoryKey)){
        chatHistory = data;
        return;
      }

      playerHints[key] = data;

      if(startPlaySequenceTemp.length === 0){
        setLog(key, data);
      }
    });

    if(gameState !== ""){
      setLog(`투표`, '---------------');
    }

    Object.keys(votingList).forEach((player)=>{
      setLog(`${player}`, `${votingList[player]}님을 투표하였습니다.`);
    });

    if(gameState !== ""){
      setLog(`힌트`, '---------------');
    }

    startPlaySequenceTemp.forEach((player)=>{
      if(!playerHints[player]){
        return;
      }
      
      setLog(player, playerHints[player]);
    });
});

function gameSetting(snapshot){
  playerSelectCheck = [];

  correct = snapshot[correctKey];
  fakeCorrect = snapshot[fakeCorrectKey];
  category = snapshot[categoryKey];
  lastAnswer = snapshot[lastAnswerRef];
  suspect = snapshot[suspectKey];

  if(startKey in snapshot){
    chatStart();
    gameState = startKey;
    let result = {};
    result[startKey] = null;
    updateData(result);
    reloadEvent();
  }

  if(sequenceKey in snapshot){
    const data = snapshot[sequenceKey];

    if(data === "end"){
      // 토론시간
      showAlert("토론시간", "1분의 토론시간이 주어집니다.");
      timer(60,()=>{
        selectTimeout = true;
        sendSusepct();
      });
      let result = {};
      result[sequenceKey] = null;
      updateData(result);

      selectPlayerField.className = "show";
      hintFiled.className = "none";
    }
    else if(playSequence.length === 0) {
      if(playerList.length === 0){
        setPlayerList(data);
        nicknameField.className = "none";
        startPlaySequenceTemp = data;
      }

      playSequence = data;

      startGame(); 
    }
    else {
      playSequence = data;

      startGame();
    }
  }

  if(reSelectCulpritKey in snapshot){
    const data = snapshot[reSelectCulpritKey];
    showAlert("투표 동점", `${data.join(",")}중에 한명을 선택해주세요.`);
    setPlayerList(data);
    timer(60,sendSusepct);
    let result = {};
    result[reSelectCulpritKey] = null;
    result[sequenceKey] = null;
    updateData(result);
  }

  if(lastAnswerKey in snapshot){
    const data = snapshot[lastAnswerKey];

    if(correct === data){
      showAlert("범인 승리", `범인이 정답(${data})을 맞췄습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
    }
    else {
      showAlert("시민 승리",`범인의 최종 답은 ${data}으로 답하였습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
    }

    stopTimer();
    reloadEvent();
    chatClose();
    return;
  }

  if(selectCulpritKey in snapshot){
    const data = snapshot[selectCulpritKey];

    if(suspect !== data){
      showAlert("범인이 아닙니다.", `범인은 ${suspect}였습니다.`);
      chatClose();
      return;
    }

    selectPlayerField.className = "none";
    stopTimer();

    if(nickname === data){
      showAlert("범인인것을 걸렸습니다.", "정답을 맞춰주세요.");
      lastAnswer = data;
      hintBtnField.className = "none";
      answerField.className = "show";
      timer(60, sendLastAnswer);
    }
    else {
      showAlert("범인을 찾았습니다.", "범인이 답을 입력하고 있습니다.");
      timer(60);
    }
  }


  Object.keys(snapshot).forEach((key)=>{
    if(key.includes("SuspectList")){
      playerSelectCheck[key.split("-")[1]] = snapshot[key];
    }
  });

  if(selectTimeoutKey in snapshot){
    if(Object.keys(playerSelectCheck).length === playerList.length && admin){
      selectCulprit();
    }
  }

  if(outGameKey in snapshot){
    showAlert("알림","플레이어중 한명이 나갔습니다.\n게임을 초기화합니다.");
    clearDatabase();
    removeReloadEvent();
    restart = true;
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
    result[reSelectCulpritKey] = sameList;

    playerList.forEach((player)=>{
      result[`${suspectListKey}-${player}`] = null;
    });
  }
  else {
    result[selectCulpritKey] = maxSuspect.suspect;
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

  result[categoryKey] = category;
  result[correctKey] = correct;
  result[fakeCorrectKey] = fakeCorrect;

  return result;
}

startField.addEventListener("click",()=>{
  get(child(dbRef, gameDataKey)).then((snapshot) => {
    if (snapshot.exists()) {
      let list = [];

      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;

        if(key === startKey){
          return;
        }

        list.push(key);
      });

      let result = gameInit();

      const shuffleList = shuffleStrings(list);

      suspect = pickRandom(shuffleList);

      result[sequenceKey] = shuffleList;
      result[suspectKey] = suspect;

      categoryField.innerText = category;
      
      if(nickname === suspect){
        correctField.innerText = fakeCorrect;
      }
      else {
        correctField.innerText = correct;
      }

      updateData(result);
    } else {
      console.log("데이터가 없습니다.");
    }
  });

  clearDatabase();
  let result = {};
  result[startKey] = `Start Game${new Date().getTime()}`
  updateData(result);
});

function updateData(data, table = gameDataKey) {
  update(ref(db, table), data);
}

clearField.addEventListener("click",()=>{
  clearDatabase();
});

function clearDatabase() {
  set(ref(db, '/'), null);
}

hintBtnField.addEventListener("click", sendHint);

function sendHint(){
  if(myTurn()){
    stopTimer();
    let result = {};

    if(playSequence.length !== 1){
      result[sequenceKey] = playSequence.slice(1, playSequence.length);
    }
    else {
      result[sequenceKey] = "end";
      showAlert("토론시간", "1분의 토론시간이 주어집니다.");
      timer(60,sendSusepct);
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
    result[lastAnswerKey] = answerInputField.value;
    result[selectCulpritKey] = "";
    updateData(result);
  }
}

function setPlayerList(data){
  playerList = data;

  playerSelectField.innerText = "";

  
  
  JSON.parse(JSON.stringify(data)).sort().forEach((player)=>{
    const optionElement = document.createElement("option");
    optionElement.value = player;
    optionElement.innerText = player;

    playerSelectField.appendChild(optionElement);
  });
}

function startGame() {
  let correctTemp = nickname === suspect ? fakeCorrect : correct;

  categoryField.innerText = category;
  correctField.innerText = correctTemp;

  stateInfoField.innerText = `${playSequence[0]}님이 입력하고 있습니다.`;

  if(myTurn()){
    timer(30, sendHint);
    showAlert("당신 순서입니다.",`카테고리는 ${category}, 제시어는 ${correctTemp}입니다.`);
    gameState = "Playing";
    hintFiled.className = "show";
    return;
  }
  else {
    timer(30);
  }
  
  if(gameState === startKey){
    showAlert("게임시작", `카테고리는 ${category}, 제시어는 ${correctTemp}입니다.`);
    gameState = "Playing";
  }
}

function myTurn() {
  return playSequence[0] === nickname;
}

function timer(timeLimit = 30, timeoutCallback = () => {}) {
  let time = timeLimit;

  if (inteval) {
    stopTimer();
  }

  inteval = setInterval(() => {
    if (time < 0) {
      stopTimer();
      timeoutCallback();
      return;
    }

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(seconds).padStart(2, '0');

    timerField.innerText = `${displayMinutes}:${displaySeconds}`;
    
    time -= 1;
  }, 1000);
}

function stopTimer() {
  clearInterval(inteval);
  timerField.innerText = "";
}

sespectInputField.addEventListener("click",sendSusepct);

function sendSusepct(){
  const selectSuspectKey = `${suspectListKey}-${nickname}`;
  let result = {};
  result[selectSuspectKey] = playerSelectField.value;

  if(selectTimeout){
    result[selectTimeoutKey] = true;
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
    result[outGameKey] = true;
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

    result[chatHistoryKey] = chatHistory;

    updateData(result, chatDataKey);
  }
}

function closeClick(){
  if(restart){
    location.reload();
  }
}