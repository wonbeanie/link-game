export function Chat(onSendClick = ()=>{}){
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatWindow = document.getElementById('chat-window');
  let startChat = false;

  function addChatMessage(nickname, message) {
    if(!startChat){
      return;
    }
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg';
    msgDiv.innerHTML = `<b>${nickname}:</b> ${message}`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function chatClear(){
    chatWindow.innerHTML = "";
    if(startChat){
      addChatMessage("서버", "채팅에 접속하였습니다.");
      return;
    }
  }

  function chatStart(){
    chatSend.addEventListener('click', sendClick);
    chatInput.addEventListener('keypress', onEnterPress);
    startChat = true;
    addChatMessage("서버", "채팅에 접속하였습니다.");
  }

  function sendClick(){
    const msg = chatInput.value.trim();
    onSendClick(msg);
    chatInput.value = '';
  }

  function chatClose(){
    chatSend.removeEventListener('click', sendClick);
    chatInput.removeEventListener('keypress', onEnterPress);
    addChatMessage("서버", "채팅이 종료되었습니다.");
    startChat = false;
  }

  function onEnterPress(e){
    if (e.key === 'Enter') chatSend.click();
  }

  return {
    addChatMessage,
    chatStart,
    chatClose,
    chatClear
  };
}

export function shuffleStrings(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function pickRandom(array) {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}


export function Alert(closeClick = ()=>{}){
  const titleElement = document.getElementById('alertTitle');
  const messageElement = document.getElementById('alertMessage');
  const alertElement = document.getElementById('alert');
  const closeAlertElement = document.getElementById("close-alert");

  function showAlert(title, message) {
    if(checkShowAlert()){
      titleElement.textContent = title;
      messageElement.textContent = message;
      return;
    }

    titleElement.textContent = title;
    messageElement.textContent = message;
    alertElement.style.display = 'flex';
  }

  function checkShowAlert(){
    return alertElement.style.display === 'flex';
  }

  function closeAlert() {
    alertElement.style.display = 'none';
  }

  closeAlertElement.addEventListener("click",onCloseClick);

  function onCloseClick(){
    closeClick();
    closeAlert();
  }

  return {
    showAlert
  }
}

export function Log(){
  const display = document.getElementById('display');

  function setLog(player, text){
    const playerElement = document.createElement("div");
    playerElement.className = "player-hint-item"; 

    const playerNameElement = document.createElement("span");
    playerNameElement.style.fontWeight = "bold";
    playerNameElement.style.color = "var(--primary-color)";
    playerNameElement.textContent = player;

    const separator = document.createElement("span");
    separator.textContent = " : ";
    separator.style.color = "#a0aec0";

    const hintElement = document.createElement("span");
    hintElement.style.color = "var(--text-color)";
    hintElement.textContent = text;

    playerElement.appendChild(playerNameElement);
    playerElement.appendChild(separator);
    playerElement.appendChild(hintElement);

    display.appendChild(playerElement);

    display.scrollTop = display.scrollHeight;
  }

  function clearLog(){
    display.innerHTML = "";
  }

  return {
    setLog,
    clearLog
  }
}

export function Timer(){
  const timerField = document.getElementById("timer");
  let inteval = null;
  
  
  function startTimer(timeLimit = 30, timeoutCallback = () => {}) {
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

      timerField.textContent = `${displayMinutes}:${displaySeconds}`;
      
      time -= 1;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(inteval);
    timerField.textContent = "";
  }

  return {
    startTimer,
    stopTimer
  }
}