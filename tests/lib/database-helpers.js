import { updateTable } from "../../src/lib/database-utils.js";
import { deepCopy, TABLE_KEYS, WATTING_ROOM_STATE } from "../../src/lib/modules.js";
import { gameDataTable, nickname } from "../__mocks__/mock-peerjs.js";

let playerList = [];

export async function getDatabase(){
  return (await import("../../src/database/database.js")).default;
}

export const setPlayers = jest.fn(async (addPlayers) => {
  const gameDatabase = await getDatabase();

  playerList = [];
  let newDatabase = {};

  addPlayers.forEach((player) => {
    newDatabase[player] = WATTING_ROOM_STATE.READY;
    playerList.push(player);
  })

  gameDatabase.database[gameDataTable] = newDatabase;
  gameDatabase.listener[gameDataTable](newDatabase);
});

export const mockDatabaseUpdate = jest.fn(async (newData, init = true, update = false) => {
  const gameDatabase = await getDatabase();

  if(init){
    gameDatabase.database = newData;
    return;
  }

  const databaseTemp = {
    ...gameDatabase.database,
    [gameDataTable] : updateTable(gameDatabase.database[gameDataTable], newData)
  }

  if(update){
    gameDatabase.database = databaseTemp;
    gameDatabase.listener[gameDataTable](databaseTemp[gameDataTable]);
  }
});

export const getPlayers = jest.fn(() => {
  return playerList;
});