// 현재 realtime database = 데이터 저장 -> onValue

// set -> onValue
// update -> onValue
// get -> ??

let onValueCallback = {};
let database = {};
let config = {};

function getSnapshot(data){
  return {
    val(){
      return data;
    }
  }
}

export const set = jest.fn((ref, data) => {
  if(ref.table === "/"){
    if(data === null){
      database = {};
      return;
    }
    database = data;
    return;
  }
  database[ref.table] = data;
  return {
    ref,
    data
  }
});

export const update = jest.fn((ref, data) => {
  if(config.Sequence && data.hasOwnProperty("Sequence")){
    data["Sequence"] = [nickname, userNickname];
    config.Sequence = false;
  }

  let noUpdate = true;

  if(database[ref.table]){
    Object.keys(data).some((key)=>{
      if(database[ref.table].hasOwnProperty(key)){
        if(database[ref.table][key] !== data[key]){
          noUpdate = false;
          return false;
        }
      }
      else {
        noUpdate = false;
        return false;
      }
    });
  }
  else {
    noUpdate = false;
  }

  if(isEqual(database[ref.table], data) || noUpdate){
    return;
  }

  database[ref.table] = {
    ...database[ref.table],
    ...data
  };

  Object.entries(database[ref.table]).forEach(([key, value])=>{
    if(value === null){
      delete database[ref.table][key];
    }
  });

  const snapshot = getSnapshot(database[ref.table]);
  onValueCallback[ref.table](snapshot);
})

export const onValue = jest.fn((ref, callback) =>{
  onValueCallback[ref.table] = callback;
})

export const get = jest.fn((db) => {
  let databaseTemp = database;
  return new Promise((resolve, rejec)=>{
    resolve({
      exists(){
        return true;
      },
      val : () => {
        if(db.table === ""){
          return databaseTemp;
        }

        return databaseTemp[db.table];
      }
    });
  });
});

export const getDatabase = jest.fn((app) => {
  return app;
});

export const ref = jest.fn((db, table = "/") => {
  return {
    db,
    table
  }
})

export const child = jest.fn((ref, table) => {
  return {
      ref,
      table
  };
})

export const mockDatabaseUpdate = jest.fn((newData, init = true, update = false) => {
  if(init){
    database = newData;
    return;
  }

  let databaseTemp = {
    ...database
  }

  databaseTemp[gameDataTable] = {
    ...newData
  }

  if(update){
    onValueCallback[gameDataTable]({
      val : () => {
        return databaseTemp[gameDataTable];
      }
    });
  }
});

export const setPlayers = jest.fn((addPlayers)=>{
  onValueCallback[gameDataTable]({
    val : () => {
      let result = {};

      addPlayers.forEach((player)=>{
        result[player] = "Ready";
      });

      return result;
    }
  });
});

export const testInit = jest.fn((newConfig, init = false)=>{
  if(init){
    config = newConfig;
    return;
  }
  config = {
    ...config,
    ...newConfig
  }
});

function isEqual(obj1, obj2) {
  // 1. 주소값이 같으면 바로 true
  if (obj1 === obj2) return true;

  // 2. 둘 중 하나라도 객체가 아니거나 null이면 false
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  // 3. 키 목록을 가져와서 개수가 다르면 false
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  // 4. 모든 키의 값이 재귀적으로 같은지 확인
  for (let key of keys1) {
    if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

export const userNickname = "유저";
export const nickname = "방장"
export const gameDataTable = "GameData/";