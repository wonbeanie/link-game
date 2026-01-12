// 현재 realtime database = 데이터 저장 -> onValue

// set -> onValue
// update -> onValue
// get -> ??

let onValueCallback = {};

function getSnapshot(data){
  return {
    val(){
      return data;
    }
  }
}

export const set = jest.fn((ref, data) => {
  return {
    ref,
    data
  }
});

export const update = jest.fn((ref, data) => {
  const snapshot = getSnapshot(data);
  onValueCallback[ref.table](snapshot);
})

export const onValue = jest.fn((ref, callback) =>{
  onValueCallback[ref.table] = callback;
})

export const get = jest.fn((db) => {
  return {
    db,
    exists(){
      return true;
    }
  }
});

export const getDatabase = jest.fn((app) => {
  return app;
});

export const ref = jest.fn((db, table) => {
  return {
    db,
    table
  }
})

export const child = jest.fn((db, table) => {
  return {
    db,
    table
  }
})