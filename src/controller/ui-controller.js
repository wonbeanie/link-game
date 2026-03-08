import uiHandler from "../handler/ui-handler.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";

class UiController {
  init(){
    eventBus.on(GameEvents.CHANGE_START, (data) => uiHandler.showGameStartAlert(data));
    eventBus.on(GameEvents.PLAYER_OUT, () => uiHandler.showGameOutAlert());
    eventBus.on(GameEvents.GAME_OVER, ({gameInfo, data : lastAnswer, findSuspect}) => uiHandler.showGameOverAlert(gameInfo, lastAnswer, findSuspect));
    eventBus.on(GameEvents.ADD_CHAT_MESSAGE, (data) => uiHandler.addChatMessageToDisplay(data));
    eventBus.on(GameEvents.CLEAR_CHAT_DISPLAY, () => uiHandler.clearChatMessageToDisplay());
    eventBus.on(GameEvents.SET_CHAT_HISTORY, () => uiHandler.clearChatInput());
    eventBus.on(GameEvents.INIT_HINT, () => uiHandler.hideReadyBtn());
    eventBus.on(GameEvents.TURN_END_HINT, () => uiHandler.hideHintInputGroup());
    eventBus.on(GameEvents.TURN_START_HINT, (data) => uiHandler.showStartMyturnHint(data));
    eventBus.on(GameEvents.UPDATE_TURN_UI, (data) => uiHandler.updateInfosUI(data));
    eventBus.on(GameEvents.READY_LOG_DATA, (data) => uiHandler.showActiveLog(data));
    eventBus.on(GameEvents.REQUEST_ADD_LOG, (data) => uiHandler.readyAddLog(data));
    eventBus.on(GameEvents.READY_PLAYER_UI, (data) => uiHandler.addLogDisplay(data));
    eventBus.on(GameEvents.VOTE_START, (data) => uiHandler.readyStartVoteUI(data));
    eventBus.on(GameEvents.REQUEST_VOTE_END, (data) => uiHandler.readyVoteEnd(data));
    eventBus.on(GameEvents.TIE_OF_VOTES, (data) => uiHandler.initTieOfVotes(data));
    eventBus.on(GameEvents.REQUEST_CHANGE_NICKNAME, (data) => uiHandler.changeNicknameUI(data));
    eventBus.on(GameEvents.DEFAULT_GAME_INFO_UPDATED, (data) => uiHandler.updateGameInfoUI(data))
    eventBus.on(GameEvents.UPDATE_TIME, (data) => uiHandler.showTimerUI(data))
    eventBus.on(GameEvents.STOP_TIMER, () => uiHandler.clearTimerUI());
    eventBus.on(GameEvents.OPEN_ADMIN_MODAL, () => uiHandler.showAdminModal());
    eventBus.on(GameEvents.CLOSE_ADMIN_MODAL, () => uiHandler.hideAdminModal());
    eventBus.on(GameEvents.INIT_GAME_UI, () => uiHandler.initGameUi());
    eventBus.on(GameEvents.CREATE_ROOM, () => uiHandler.showAdminPanel());
    eventBus.on(GameEvents.RELESE_ROOM, () => uiHandler.releseRoom());
    eventBus.on(GameEvents.NOT_SETTING_NICKNAME, () => uiHandler.showNotSettingNicknameAlert());
    eventBus.on(GameEvents.NOT_READY_PLAYER, (data) => uiHandler.showNotReadyPlayersAlert(data));
  }
}

const uiController = new UiController();
export default uiController;