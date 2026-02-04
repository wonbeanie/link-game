import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { alert } from "../modules/modules.js";

class UiHandler {
  chatWindow = null;

  showGameStartAlert(){
    const {category, myCorrect} = gameData;
    alert.show("게임시작", `카테고리는 ${category}, 제시어는 ${myCorrect}입니다.`);
  }

  showGameOutAlert(){
    alert.show("알림","플레이어중 한명이 나갔습니다.\n게임을 초기화합니다.");
  }

  showGameOverAlert(data, findSusepct = false){
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
  }

  updateGameInfoUI(){
    const {category, myCorrect} = gameData;
    gameElements.info.category.textContent = category;
    gameElements.info.correct.textContent = myCorrect;
  }

  updateNicknameUI(){
    gameElements.info.nickname.textContent = gameData.nickname;
  }

  showAdminBtns(){
    gameElements.admin.display.show();
  }

  addChatMessageToDisplay(nickname, message){
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg';
    msgDiv.innerHTML = `<b>${nickname}:</b> ${message}`;


    const chatWindow = this.getChatWindow();
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  clearChatMessageToDisplay(){
    const chatWindow = this.getChatWindow();
    chatWindow.innerHTML = "";
  }

  getChatWindow(){
    if(!this.chatWindow){
      this.chatWindow = document.getElementById('chat-window');
    }

    return this.chatWindow;
  }
}

const uiHandler = new UiHandler();
export default uiHandler;