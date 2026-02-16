import { gameDataTable } from "../__mocks__/mock-firebase-database";

let playerList = [];

export const setPlayers = jest.fn(async (addPlayers) => {
  const gameDatabase = (await import("../../src/database/database.js")).default;

  playerList = [];
  let newDatabase = {};

  addPlayers.forEach((player) => {
    newDatabase[player] = "Ready";
    playerList.push(player);
  })

  gameDatabase.database[gameDataTable] = newDatabase;
  gameDatabase.listener[gameDataTable](newDatabase);
});

export const mockDatabaseUpdate = jest.fn(async (newData, init = true, update = false) => {
  const gameDatabase = (await import("../../src/database/database.js")).default;

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
    gameDatabase.listener[gameDataTable](databaseTemp[gameDataTable]);
  }
});