import gameDatabase from "../database/database.js";
import eventBus from "../modules/event-bus.js";
import { GameEvents } from "../modules/events.js";
import gameElements from "../modules/game-elements.js";
import { TABLE_KEYS } from "../modules/modules.js";
import gameSetupService from "../service/game-setup-service.js";

class AdminHandler {
  start = async () => {
    const defaultData = await gameSetupService.createDefaultData();

    gameDatabase.clearDatabase();

    const newDatabase = {
      ...defaultData,
      [TABLE_KEYS.START] : `Start Game(${new Date().getTime()})`
    };

    gameDatabase.updateData(newDatabase);
    eventBus.emit(GameEvents.CLOSE_ADMIN_MODAL);
  }

  clear = () => {
    gameDatabase.clearDatabase(true);
    eventBus.emit(GameEvents.INIT_GAME_UI);
  }

  modalOpen = () => {
    eventBus.emit(GameEvents.OPEN_ADMIN_MODAL);
  }

  modalClose = () => {
    eventBus.emit(GameEvents.CLOSE_ADMIN_MODAL);
  }

  createRoom = () => {
    eventBus.emit(GameEvents.CREATE_ROOM);
  }

  copyRoomId = () => {
    navigator.clipboard.writeText(gameElements.webrtc.myId.textContent);
  }
}

const adminHandler = new AdminHandler();
export default adminHandler;