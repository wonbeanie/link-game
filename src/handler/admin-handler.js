import gameDatabase from "../database/database.js";
import { TABLE_KEYS } from "../modules/modules.js";
import gameSetupService from "../service/game-setup-service.js";
import uiHandler from "./ui-handler.js";

class AdminHandler {
  setAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    const admin = Boolean(urlParams.get('admin')) || false;
    
    if(admin){
      uiHandler.showAdminBtns();
    }

    return admin;
  }

  start = async () => {
    const defaultData = await gameSetupService.createDefaultData();

    gameDatabase.clearDatabase();

    const newDatabase = {
      ...defaultData,
      [TABLE_KEYS.START] : `Start Game(${new Date().getTime()})`
    };

    gameDatabase.updateData(newDatabase);
  }

  clear = () => {
    gameDatabase.clearDatabase();
  }
}

const adminHandler = new AdminHandler();
export default adminHandler;