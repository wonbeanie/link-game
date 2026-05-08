import lightDBPromise from "./lightdb-loader.js";

/** @type {import('@wonbeanie/lightdb').LightDB | null} */
let lightDB = null;

export async function initLightDB() {
  if (lightDB) return lightDB;

  lightDB = await lightDBPromise;

  return lightDB;
}

export function getLightDB() {
  if (!lightDB) {
    throw new Error("LightDB가 아직 초기화되지 않았습니다. initLightDB()를 먼저 호출하세요.");
  }

  return lightDB;
}

export function createRoom(...args) {
  const db = getLightDB();
  return db.createRoom(...args);
}

export function joinRoom(...args) {
  const db = getLightDB();
  return db.joinRoom(...args);
}

export function clear(...args) {
  const db = getLightDB();
  return db.clear(...args);
}

export function update(...args) {
  const db = getLightDB();
  return db.update(...args);
}

export function remove(...args) {
  const db = getLightDB();
  return db.remove(...args);
}

export function on(...args) {
  const db = getLightDB();
  return db.on(...args);
}

export function off(...args) {
  const db = getLightDB();
  return db.off(...args);
}

export function onPeer(...args) {
  const db = getLightDB();
  return db.onPeer(...args);
}

export function offPeer(...args) {
  const db = getLightDB();
  return db.offPeer(...args);
}