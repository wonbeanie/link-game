import gameDatabase from "../database/database.js";
import gameElements from "../modules/game-elements.js";
import { TABLE_KEYS } from "../modules/modules.js";
import gameHandler from "./game-handler.js";
import uiHandler from "./ui-handler.js";

class AdminHandler {
  admin = false;

  setAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    this.admin = Boolean(urlParams.get('admin')) || false;
    
    if(this.admin){
      uiHandler.showAdminBtns();
    }
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