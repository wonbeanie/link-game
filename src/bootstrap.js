import uiController from "./controller/ui-controller.js";
import "./service/game-state-manager.js";
import "./handler/index.js"
import gameController from "./controller/game-controller.js";
import gameDatabase from "./database/database.js";
import gameManager from "./lib/game-manager.js";
import { DATABASE_KEYS } from "./lib/modules.js";
import webRTC from "./database/webRTC.js";
import lightDB from "./database/lightDB.js";

uiController.init();

// gameDatabase.onValueListener(DATABASE_KEYS.CHAT_DATA_KEY, gameController.updateChat);
// gameDatabase.onValueListener(DATABASE_KEYS.GAME_DATA_KEY, gameManager.updateGame);

// lightDB.on(DATABASE_KEYS.CHAT_DATA_KEY, gameController.updateChat);
lightDB.on(DATABASE_KEYS.GAME_DATA_KEY, gameManager.updateGame);

gameController.init();
webRTC.init();