import { DATABASE_KEYS, WATTING_ROOM_STATE } from "../../src/lib/modules.js";

let playerList = [];

export async function getDatabase(){
  const { getLightDB } = await import("../../src/database/lightdb-controller.js");
  return getLightDB();
}

export const setPlayers = jest.fn(async (addPlayers) => {
  const gameDatabase = await getDatabase();

  playerList = [];
  let newDatabase = {};

  addPlayers.forEach((player) => {
    newDatabase[player] = WATTING_ROOM_STATE.READY;
    playerList.push(player);
  })

  const resetDatabase = Object.fromEntries(
    Object.keys(gameDatabase.database[DATABASE_KEYS.GAME_DATA_KEY] || {})
      .map((player) => [player, null])
  );

  await gameDatabase.update(DATABASE_KEYS.GAME_DATA_KEY, {
    ...resetDatabase,
    ...newDatabase
  });
});

export const mockLightDBUpdate = jest.fn(async (newData, init = true, update = false) => {
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
