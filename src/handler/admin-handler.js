import gameDatabase from "../database/database.js";
import gameElements from "../modules/game-elements.js";
import gameStore from "../modules/game-store.js";
import { TABLE_KEYS } from "../modules/modules.js";
import gameHandler from "./game-handler.js";
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
    const defaultData = await gameHandler.createDefaultData();

    gameDatabase.clearDatabase();

    let result = {};
    
    result[TABLE_KEYS.START] = `Start Game${new Date().getTime()}`
    result = {
      ...result,
      ...defaultData
    };

    gameDatabase.updateData(result);
  }

  clear = () => {
    gameDatabase.clearDatabase();
  }
}

const adminHandler = new AdminHandler();
export default adminHandler;