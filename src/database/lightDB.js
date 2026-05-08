import lightDBPromise from "./lightdb-loader.js";

/** @type {import('@wonbeanie/lightdb').LightDB | null} */
let instance = null;

export async function initLightDB() {
  if (instance) return instance;

  instance = await lightDBPromise;

  return instance;
}

export function getLightDB() {
  if (!instance) {
    throw new Error("LightDB가 아직 초기화되지 않았습니다. initLightDB()를 먼저 호출하세요.");
  }

  return instance;
}

const lightDB = new Proxy({}, {
  get(_target, property) {
    const db = getLightDB();
    const value = db[property];

    if (typeof value === "function") {
      return value.bind(db);
    }

    return value;
  },
  set(_target, property, value) {
    const db = getLightDB();
    db[property] = value;
    return true;
  }
});

export default lightDB;
