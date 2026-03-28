import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import gameElements from "../lib/game-elements.js";
import { alert, deepCopy } from "../lib/modules.js";

class UiHandler {

  changeNicknameUI(nickname){
    uiHandler.updateNicknameUI(nickname);
    uiHandler.updateNicknameInfoUI(nickname);
  }

  initTieOfVotes(tiePlayer){
    this.showTieOfVotesAlert(tiePlayer.join(","));
    this.updateSuspectVoteOptions(tiePlayer);
  }

  readyVoteEnd({isSuspect, selectedSuspect}){
    this.showVotingResults(isSuspect);
    eventBus.emit(GameEvents.READY_TO_VOTE_END, selectedSuspect);
  }

  readyStartVoteUI(startPlaySequence){
    this.updateSuspectVoteOptions(startPlaySequence);
    this.showVoteTurnAlert();
    this.showVoteInputGroup();
    this.hideHintInputGroup();
  }
  
  readyAddLog(message){
    this.clearLogDisplay();
    eventBus.emit(GameEvents.READY_TO_ADD_LOG, message);
  }

  updateInfosUI({correctTurn, category, correct}){
    this.updateTurnStateUI(correctTurn);
    this.updateGameInfoUI({category, correct});
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

  showStartMyturnHint({category, correct}){
    this.showMyTurnAlert(category, correct);
    this.showHintInputGroup();
  }

  showActiveLog(logData){
    Object.entries(logData).forEach(([player, info])=>{
      this.createLogElement(player, info);
    });
  }

  showGameStartAlert({category, correct}){
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

  updateGameOverUI(gameInfo, lastAnswer = "", findSusepct = false){
    this.showGameOverAlert(gameInfo, lastAnswer, findSusepct);
    this.updateGameEndStateUI(gameInfo, lastAnswer, findSusepct);
  }

  updateGameInfoUI({category, correct}){
    gameElements.info.category.textContent = category;
    gameElements.info.correct.textContent = correct;
  }

  updateNicknameInfoUI(nickname){
    gameElements.info.nickname.textContent = nickname;
  }

  addChatMessageToDisplay({nickname, message}){
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

  showNicknameInputGroup(){
    gameElements.nickname.show();
  }

  hideNicknameInputGroup(){
    gameElements.nickname.hide();
  }

  hideHintInputGroup(){
    gameElements.hint.hide();
    gameElements.hint.value = "";
  }

  showHintInputGroup(){
    gameElements.hint.show();
  }

  updateTurnStateUI(player){
    gameElements.info.state.textContent = `${player}님이 입력하고 있습니다.`;
  }

  updateVoteStateUI(){
    gameElements.info.state.textContent = `투표 진행중`;
  }

  updateLastAnswerStateUI(){
    gameElements.info.state.textContent = `범인이 플레이어들의 제시어를 입력하고 있습니다.`;
  }

  updateGameEndStateUI({correct, fakeCorrect, suspect}, lastAnswer, findSusepct){
    const gameResult = `(범인 : '${suspect}', 제시어 : '${correct}', 가짜 제시어, '${fakeCorrect}')`;
    if(findSusepct){
      if(correct === lastAnswer){
        gameElements.info.state.textContent = `범인 승리 ${gameResult}`;
      }
      else {
        gameElements.info.state.textContent = `시민 승리 ${gameResult}`;
      }
      return;
    }

    gameElements.info.state.textContent = `게임 종료 ${gameResult}`;
  }

  addLogDisplay({player, text}){
    const playerCard = document.createElement("div")
    playerCard.className = "mini-card";

    const name = document.createElement("h3");
    name.className = "name";
    name.textContent = player;

    const readyElement = document.createElement("div");
    readyElement.className = "row";
    const readyBadge = document.createElement("span");
    readyBadge.className = "badge blue";
    readyBadge.textContent = "상태";
    const readyText = document.createElement("span");
    readyText.className = "text";
    readyText.textContent = text;
    readyElement.appendChild(readyBadge);
    readyElement.appendChild(readyText);

    playerCard.appendChild(name);
    playerCard.appendChild(readyElement);

    gameElements.log.appendChild(playerCard);
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

  hideAnswerInputGroup(){
    gameElements.answer.value = "";
    gameElements.answer.hide();
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

  showTimerUI({displayMinutes, displaySeconds}){
    gameElements.timer.textContent = `${displayMinutes}:${displaySeconds}`;
  }

  clearTimerUI(){
    gameElements.timer.textContent = "";
  }

  showAdminModal(){
    gameElements.admin.modal.show();
  }

  hideAdminModal(){
    gameElements.admin.modal.hide();
  }

  initGameUi(){
    gameElements.chat.display.textContent = "";
    gameElements.log.textContent = "";
    gameElements.info.category.textContent = "-";
    gameElements.info.correct.textContent = "-";
    gameElements.info.state.textContent = "플레이어를 기다리는 중";
    gameElements.timer.textContent = "00:00";
    this.showReadyBtn();
    this.hideHintInputGroup();
    this.hideVoteInputGroup();
    this.hideAnswerInputGroup();
    this.hideAdminModal();
    eventBus.emit(GameEvents.DONE_INIT_GAME_UI);
  }

  showAdminPanel(){
    gameElements.admin.adminPanel.show();
    gameElements.admin.createDisplay.hide();
    this.hideNicknameInputGroup();
    this.showReadyBtn();
  }

  releseRoom(){
    this.clearConnectInput();
    this.hideAdminPanel();
    this.hideNicknameInputGroup();
    this.showReadyBtn();
  }

  clearConnectInput(){
    gameElements.webrtc.adminId.value = "";
  }

  hideAdminPanel(){
    gameElements.admin.display.hide();
  }

  showReadyBtn(){
    gameElements.ready.display.show();
  }

  hideReadyBtn() {
    gameElements.ready.display.hide();
  }

  showNotSettingNicknameAlert(){
    alert.show("알림","닉네임을 설정해주세요.");
  }

  showNotReadyPlayersAlert(names){
    alert.show("알림",`${names}이 준비 완료를 하지 않았습니다.`)
  }

  createLogElement(player, {hint = "", vote = "", skip = false}) {
    const playerCard = document.createElement("div")
    playerCard.className = "mini-card";

    const name = document.createElement("h3");
    name.className = "name";
    name.textContent = player;

    const hintElement = document.createElement("div");
    hintElement.className = "row";
    const hintBadge = document.createElement("span");
    hintBadge.className = "badge blue";
    hintBadge.textContent = "힌트";
    const hintText = document.createElement("span");
    hintText.className = "text";
    hintText.textContent = hint;
    hintElement.appendChild(hintBadge);
    hintElement.appendChild(hintText);

    const voteElement = document.createElement("div");
    voteElement.className = "row";
    const voteBadge = document.createElement("span");
    voteBadge.className = "badge purple";
    voteBadge.textContent = "투표";
    const voteText = document.createElement("span");
    voteText.className = "text bold";
    voteText.textContent = `${vote}${skip ? ' (스킵 동의)' : ''}`;

    voteElement.appendChild(voteBadge);
    voteElement.appendChild(voteText);

    playerCard.appendChild(name);
    playerCard.appendChild(hintElement);
    playerCard.appendChild(voteElement);

    gameElements.log.appendChild(playerCard);
    gameElements.log.scrollTop = gameElements.log.scrollHeight;
  }

  showNotSkipAlert(){
    alert.show("알림","투표 후 스킵이 가능합니다.");
  }
}

const uiHandler = new UiHandler();
export default uiHandler;