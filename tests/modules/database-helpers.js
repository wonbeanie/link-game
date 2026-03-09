import { deepCopy, TABLE_KEYS, WATTING_ROOM_STATE } from "../../src/modules/modules.js";
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

  let databaseTemp = {
    ...gameDatabase.database
  }

  databaseTemp[gameDataTable] = {
    ...databaseTemp[gameDataTable],
    ...newData
  }

  Object.entries(databaseTemp[gameDataTable]).forEach(([key, value])=>{
    if(value === null){
      delete databaseTemp[gameDataTable][key];
    }
  });

  if(update){
    gameDatabase.database = databaseTemp;
    gameDatabase.listener[gameDataTable](databaseTemp[gameDataTable]);
  }
});

export const getPlayers = jest.fn(() => {
  return playerList;
});