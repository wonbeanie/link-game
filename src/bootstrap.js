import uiController from "./controller/ui-controller.js";
import "./service/game-state-manager.js";
import "./handler/index.js"
import gameController from "./controller/game-controller.js";
import gameManager from "./lib/game-manager.js";
import { DATABASE_KEYS } from "./lib/modules.js";
import lightDB from "./database/lightDB.js";
import { chatHandler } from "./handler/index.js";

uiController.init();

lightDB.on(DATABASE_KEYS.CHAT_DATA_KEY, gameController.updateChat);
lightDB.on(DATABASE_KEYS.GAME_DATA_KEY, gameManager.updateGame);
lightDB.onPeer("connection", () => {
  chatHandler.chatStart();
});

gameController.init();