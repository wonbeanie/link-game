import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";
import gameElements from "../modules/game-elements.js";
import { alert, deepCopy } from "../modules/modules.js";

class UiHandler {
  constructor(){
    eventBus.on(GameEvents.CHANGE_START, ({category, correct}) => {
      this.showGameStartAlert(category, correct);
    });
    eventBus.on(GameEvents.PLAYER_OUT, () => this.showGameOutAlert());
    eventBus.on(GameEvents.GAME_OVER, ({gameInfo, data : lastAnswer, findSuspect}) => {
      this.showGameOverAlert(gameInfo, lastAnswer, findSuspect);
    })
    eventBus.on(GameEvents.INIT_ADMIN, () => this.showAdminBtns());
    eventBus.on(GameEvents.ADD_CHAT_MESSAGE, ({nickname, message}) => {
      this.addChatMessageToDisplay(nickname, message);
    });
    eventBus.on(GameEvents.CLEAR_CHAT_DISPLAY, () => {
      this.clearChatMessageToDisplay();
    });
    eventBus.on(GameEvents.SET_CHAT_HISTORY, () => {
      this.clearChatInput();
    });
    eventBus.on(GameEvents.INIT_HINT, () => this.hideNicknameInputGroup());
    eventBus.on(GameEvents.TURN_END_HINT, () => this.hideHintInputGroup());
    eventBus.on(GameEvents.TURN_START_HINT, ({category, correct}) => {
      this.showMyTurnAlert(category, correct);
      this.showHintInputGroup();
    });
    eventBus.on(GameEvents.UPDATE_TURN_UI, ({correctTurn, category, correct}) => {
      this.updateTurnStateUI(correctTurn);
      this.updateGameInfoUI(category, correct);
    });
    eventBus.on(GameEvents.READY_LOG_DATA, ({vote, hint}) => {
      this.showActiveLog(vote, hint)
    })
    eventBus.on(GameEvents.ADD_LOG, () => this.clearLogDisplay());
    eventBus.on(GameEvents.READY_PLAYER_UI, ({player, text}) => this.addLogDisplay(player, text));
    eventBus.on(GameEvents.VOTE_START, (startPlaySequence) => {
      this.updateSuspectVoteOptions(startPlaySequence);
      this.showVoteTurnAlert();
      this.showVoteInputGroup();
      this.hideHintInputGroup();
    });
    eventBus.on(GameEvents.VOTE_END, ({isSuspect}) => this.showVotingResults(isSuspect));
    eventBus.on(GameEvents.TIE_OF_VOTES, (tiePlayer) => {
      this.showTieOfVotesAlert(tiePlayer.join(","));
      this.updateSuspectVoteOptions(tiePlayer);
    });
    eventBus.on(GameEvents.REQUEST_CHANGE_NICKNAME, (nickname) => {
      this.updateNicknameUI(nickname);
    });
    eventBus.on(GameEvents.DEFAULT_GAME_INFO_UPDATED, ({category, correct}) => {
      this.updateGameInfoUI(category, correct);
    })
  }

  showVotingResults(isSuspect){
    this.hideVoteInputGroup();
    if(isSuspect){
      this.showAnswerTurnAlert();
      this.hideHintInputGroup();
      this.showAnswerInputGroup();
    }
    else {
      this.showWeFindSuspectAlert();
    }
  }

  showActiveLog(vote, hint){
    vote.forEach(([player, text]) => {
      this.addLogDisplay(player, text);
    });

    hint.forEach(([player, text]) => {
      this.addLogDisplay(player, text);
    });
  }

  showGameStartAlert(category, correct){
    alert.show("게임시작", `카테고리는 ${category}, 제시어는 ${correct}입니다.`);
  }

  showGameOutAlert(){
    alert.show("알림","플레이어중 한명이 나갔습니다.\n게임을 초기화합니다.");
  }

  showGameOverAlert(gameInfo, lastAnswer = "", findSusepct = false){
    const {correct, fakeCorrect, suspect} = gameInfo;
    if(findSusepct){
      if(correct === lastAnswer){
        alert.show("범인 승리", `범인이 정답(${lastAnswer})을 맞췄습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
      }
      else {
        alert.show("시민 승리",`범인의 최종 답은 ${lastAnswer}으로 답하였습니다.\n 범인의 제시어 ${fakeCorrect}\n 시민의 제시어 ${correct}`);
      }
      return;
    }

    alert.show("범인이 아닙니다.", `범인은 ${suspect}였습니다.`);
  }

  updateGameInfoUI(category, correct){
    gameElements.info.category.textContent = category;
    gameElements.info.correct.textContent = correct;
  }

  updateNicknameInfoUI(nickname){
    gameElements.info.nickname.textContent = nickname;
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

  updateTurnStateUI(player){
    gameElements.info.state.textContent = `${player}님이 입력하고 있습니다.`;
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
    
    deepCopy(voteList).sort().forEach((player)=>{
      const optionElement = document.createElement("option");
      optionElement.value = player;
      optionElement.textContent = player;

      gameElements.vote.appendChild(optionElement);
    });
  }

  showAnswerInputGroup(){
    gameElements.answer.show();
  }

  updateNicknameUI(value){
    gameElements.nickname.value = value;
  }

  showMyTurnAlert(category, correct){
    alert.show("당신 순서입니다.",`카테고리는 ${category}, 제시어는 ${correct}입니다.`);
  }

  showVoteTurnAlert(){
    alert.show("토론시간", "1분의 토론시간이 주어집니다.");
  }

  showAnswerTurnAlert(){
    alert.show("범인인것을 걸렸습니다.", "정답을 맞춰주세요.");
  }

  showWeFindSuspectAlert(){
    alert.show("범인을 찾았습니다.", "범인이 답을 입력하고 있습니다.");
  }

  showTieOfVotesAlert(suspectList){
    alert.show("투표 동점", `${suspectList}중에 한명을 선택해주세요.`);
  }

  showTimerUI(minutes, seconds){
    gameElements.timer.textContent = `${minutes}:${seconds}`;
  }

  clearTimerUI(){
    gameElements.timer.textContent = "";
  }
}

const uiHandler = new UiHandler();
export default uiHandler;