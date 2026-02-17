class ElementWrapper {
  constructor(id) {
    this.element = document.getElementById(id);
  }

  show() {
    this.element.classList.remove("none");
  }

  hide() {
    this.element.classList.add("none");
  }

  get value(){
    return this.element.value;
  }

  set value(value){
    this.element.value = value;
  }

  get textContent(){
    return this.element.textContent;
  }

  set textContent(textContent){
    this.element.textContent = textContent;
  }

  addEventListener(event, callback){
    this.element.addEventListener(event, callback);
  }

  removeEventListener(event, callback){
    this.element.removeEventListener(event, callback);
  }

  appendChild(element){
    this.element.appendChild(element);
  }

  click(){
    this.element.click();
  }
}

class UIGroup {
  constructor(id){
    this.display = new ElementWrapper(id);
    this.input = new ElementWrapper(`${id}-input`);
    this.btn = new ElementWrapper(`${id}-btn`);
  }

  show(){
    this.display.show();
  }

  hide(){
    this.display.hide();
  }

  get value(){
    return this.input.value;
  }

  set value(value){
    this.input.value = value;
  }

  allClearChildren(){
    this.input.textContent = "";
  }

  appendChild(element){
    this.input.element.appendChild(element);
  }
}

class GameElements {
  constructor(){
    if(GameElements.instance) return GameElements.instance;

    this.admin = {
      display : new ElementWrapper("admin-btn"),
      start : new ElementWrapper("start"),
      clear : new ElementWrapper("clear"),
      modal : new ElementWrapper("admin-modal"),
      open : new ElementWrapper("open-admin-modal"),
      close : new ElementWrapper("modal-close-btn"),
      create : new ElementWrapper("create-room-btn"),
      adminPanel : new ElementWrapper("room-info-area"),
      createDisplay : new ElementWrapper("create-room-area")
    }

    this.nickname = new UIGroup("nickname");
    this.hint = new UIGroup("hint");
    this.answer = new UIGroup("answer");
    this.vote = new UIGroup("vote");

    this.info = {
      category : new ElementWrapper("category"),
      correct : new ElementWrapper("correct"),
      state : new ElementWrapper("state-info"),
      nickname : new ElementWrapper("nickname-info")
    }

    this.chat = {
      input : new ElementWrapper('chat-input'),
      btn : new ElementWrapper('chat-send'),
      display : new ElementWrapper('chat-window')
    }

    this.log = new ElementWrapper("log-display");
    this.timer = new ElementWrapper("timer");
    
    this.webrtc = {
      myId : new ElementWrapper("my-id"),
      copyBtn : new ElementWrapper("copy-id"),
      connectBtn : new ElementWrapper("connect-btn"),
      adminId : new ElementWrapper("target-id-input")
    }
  }
}

const gameElements = new GameElements();
export default gameElements;