import uiController from "./controller/ui-controller.js";
import "./service/game-state-manager.js";
import "./handler/index.js"
import gameController from "./controller/game-controller.js";
import gameDatabase from "./database/database.js";
import gameManager from "./modules/game-manager.js";
import { DATABASE_KEYS } from "./modules/modules.js";
import webRTC from "./database/webRTC.js";

uiController.init();

gameDatabase.onValueListener(DATABASE_KEYS.CHAT_DATA_KEY, gameController.updateChat);
gameDatabase.onValueListener(DATABASE_KEYS.GAME_DATA_KEY, gameManager.updateGame);

gameController.init();
webRTC.init();