import uiHandler from "../handler/ui-handler.js";

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

class Alerter {
  restart = false;
  alertElement = null;
  closeAlertElement = null;
  titleElement = null;
  messageElement = null;

  getTitleElement(){
    if(!this.titleElement){
      this.titleElement = document.getElementById('alertTitle');
    }
    
    return this.titleElement;
  }

  getMessageElement(){
    if(!this.messageElement){
      this.messageElement = document.getElementById('alertMessage');
    }

    return this.messageElement;
  }

  getAlertElement(){
    if(!this.alertElement){
      this.alertElement = document.getElementById('alert');
      this.getCloseAlertElement();
    }

    return this.alertElement;
  }

  getCloseAlertElement(){
    if(!this.closeAlertElement){
      this.closeAlertElement = document.getElementById("close-alert");
      this.closeAlertElement.addEventListener("click",()=>{
        this.onCloseClick();
      });
    }

    return this.closeAlertElement;
  }

  show(title, message) {
    const alertElement = this.getAlertElement();
    const titleElement = this.getTitleElement();
    const messageElement = this.getMessageElement();

    if(this.checkShow()){
      titleElement.textContent = title;
      messageElement.textContent = message;
      return;
    }

    titleElement.textContent = title;
    messageElement.textContent = message;
    alertElement.style.display = 'flex';
  }

  checkShow(){
    const alertElement = this.getAlertElement();
    return alertElement.style.display === 'flex';
  }

  reload(){
    if(this.restart){
      location.reload();
    }
  }

  closeAlert() {
    const alertElement = this.getAlertElement();
    alertElement.style.display = 'none';
  }

  onCloseClick(){
    this.reload();
    this.closeAlert();
  }
}
export const alert = new Alerter();

export const timer = (function Timer(){
  let inteval = null;
  
  function startTimer(timeLimit = 30, timeoutCallback = () => {}) {
    function action(){
      if (time < 0) {
        stopTimer();
        timeoutCallback();
        return;
      }

      const minutes = Math.floor(time / 60);
      const seconds = time % 60;

      const displayMinutes = String(minutes).padStart(2, '0');
      const displaySeconds = String(seconds).padStart(2, '0');

      uiHandler.showTimerUI(displayMinutes, displaySeconds);
      
      time -= 1;
    }

    let time = timeLimit;

    if (inteval) {
      stopTimer();
    }

    action();

    inteval = setInterval(action, 1000);
  }

  function stopTimer() {
    clearInterval(inteval);
    uiHandler.clearTimerUI();
  }

  return {
    startTimer,
    stopTimer
  }
})();

export function deepCopy(obj){
  return JSON.parse(JSON.stringify(obj));
}

export const TABLE_KEYS = Object.freeze({
  CATEGORY : "Category",
  CORRECT : "Correct",
  FAKE_CORRECT : "FakeCorrect",
  LAST_ANSWER : "LastAnswer",
  OUT_GAME : "OutGame",
  CHAT_HISTORY : "ChatHistory",
  START : "Start",
  SEQUENCE : "Sequence",
  SUSPECT : "Suspect",
  SUSPECT_LIST : "SuspectList",
  SELECT_CULPRIT : "SelectCulprit",
  RE_SELECT_CULPRIT : "ReSelectCulprit",
  SELECT_TIMEOUT : "SelectTimeout"
});

export const DATABASE_KEYS = Object.freeze({
  GAME_DATA_KEY : "GameData/",
  CHAT_DATA_KEY : "Chat/",
  ROOT_KEY : "/"
})

export const SEQUENCE_END = "END";