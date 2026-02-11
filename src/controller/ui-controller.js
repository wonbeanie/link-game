import uiHandler from "../handler/ui-handler.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";

class UiController {
  init(){
    eventBus.on(GameEvents.CHANGE_START, ({category, correct}) => uiHandler.showGameStartAlert(category, correct));
    eventBus.on(GameEvents.PLAYER_OUT, () => uiHandler.showGameOutAlert());
    eventBus.on(GameEvents.GAME_OVER, ({gameInfo, data : lastAnswer, findSuspect}) => uiHandler.showGameOverAlert(gameInfo, lastAnswer, findSuspect));
    eventBus.on(GameEvents.INIT_ADMIN, () => uiHandler.showAdminBtns());
    eventBus.on(GameEvents.ADD_CHAT_MESSAGE, ({nickname, message}) => uiHandler.addChatMessageToDisplay(nickname, message));
    eventBus.on(GameEvents.CLEAR_CHAT_DISPLAY, () => uiHandler.clearChatMessageToDisplay());
    eventBus.on(GameEvents.SET_CHAT_HISTORY, () => uiHandler.clearChatInput());
    eventBus.on(GameEvents.INIT_HINT, () => uiHandler.hideNicknameInputGroup());
    eventBus.on(GameEvents.TURN_END_HINT, () => uiHandler.hideHintInputGroup());
    eventBus.on(GameEvents.TURN_START_HINT, ({category, correct}) => uiHandler.showStartMyturnHint(category, correct));
    eventBus.on(GameEvents.UPDATE_TURN_UI, (data) => uiHandler.updateInfosUI(data));
    eventBus.on(GameEvents.READY_LOG_DATA, ({vote, hint}) => uiHandler.showActiveLog(vote, hint));
    eventBus.on(GameEvents.REQUEST_ADD_LOG, (message) => uiHandler.readyAddLog(message));
    eventBus.on(GameEvents.READY_PLAYER_UI, ({player, text}) => uiHandler.addLogDisplay(player, text));
    eventBus.on(GameEvents.VOTE_START, (startPlaySequence) => uiHandler.readyStartVoteUI(startPlaySequence));
    eventBus.on(GameEvents.REQUEST_VOTE_END, (data) => uiHandler.readyVoteEnd(data));
    eventBus.on(GameEvents.TIE_OF_VOTES, (data) => uiHandler.initTieOfVotes(data));
    eventBus.on(GameEvents.REQUEST_CHANGE_NICKNAME, (data) => uiHandler.changeNicknameUI(data));
    eventBus.on(GameEvents.DEFAULT_GAME_INFO_UPDATED, ({category, correct}) => uiHandler.updateGameInfoUI(category, correct))
    eventBus.on(GameEvents.UPDATE_TIME, ({displayMinutes, displaySeconds}) => uiHandler.showTimerUI(displayMinutes, displaySeconds))
    eventBus.on(GameEvents.STOP_TIMER, () => uiHandler.clearTimerUI());
  }
}

const uiController = new UiController();
export default uiController;