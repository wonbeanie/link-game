import { DATABASE_KEYS, WATTING_ROOM_STATE } from "../../src/lib/modules.js";

let playerList = [];

export async function getDatabase(){
  return (await import("../../src/database/lightDB.js")).default;
}

export const setPlayers = jest.fn(async (addPlayers) => {
  const gameDatabase = await getDatabase();

  playerList = [];
  let newDatabase = {};

  addPlayers.forEach((player) => {
    newDatabase[player] = WATTING_ROOM_STATE.READY;
    playerList.push(player);
  })

  gameDatabase.database[DATABASE_KEYS.GAME_DATA_KEY] = newDatabase;
  gameDatabase.notify(DATABASE_KEYS.GAME_DATA_KEY, newDatabase);
});

export const mockDatabaseUpdate = jest.fn(async (newData, init = true, update = false) => {
  const gameDatabase = await getDatabase();

  if(init){
    gameDatabase.database = newData;
    return;
  }

  if(update){
    await gameDatabase.update(DATABASE_KEYS.GAME_DATA_KEY, newData);
  }
});

export const getPlayers = jest.fn(() => {
  return playerList;
});
