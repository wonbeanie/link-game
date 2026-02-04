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

    gameElements.chat.display.appendChild(msgDiv);
    gameElements.chat.display.scrollTop = gameElements.chat.display.scrollHeight;
  }

  clearChatMessageToDisplay(){
    gameElements.chat.display.textContent = "";
  }

  clearChatInput(){
    gameElements.chat.input.value = '';
  }

  hideNicknameInputGroup(){
    gameElements.nickname.hide();
  }

  hideHintInputGroup(){
    gameElements.hint.hide();
  }

  showHintInputGroup(){
    gameElements.hint.show();
  }

  updateTurnStateUI(){
    gameElements.info.state.textContent = `${gameData.playSequence[0]}님이 입력하고 있습니다.`;
  }

  addLogDisplay(player, text){
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

    gameElements.log.appendChild(playerElement);

    gameElements.log.scrollTop = gameElements.log.scrollHeight;
  }

  clearLogDisplay(){
    gameElements.log.textContent = "";
  }

  showVoteInputGroup(){
    gameElements.vote.show();
  }

  hideVoteInputGroup(){
    gameElements.vote.hide();
  }

  updateSuspectVoteOptions(voteList){
    gameElements.vote.allClearChildren();
    
    JSON.parse(JSON.stringify(voteList)).sort().forEach((player)=>{
      const optionElement = document.createElement("option");
      optionElement.value = player;
      optionElement.textContent = player;

      gameElements.vote.appendChild(optionElement);
    });
  }

  showAnswerInputGroup(){
    gameElements.answer.show();
  }
}

const uiHandler = new UiHandler();
export default uiHandler;