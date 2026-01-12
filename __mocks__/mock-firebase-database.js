
// ref, set, onValue, get, child, update
export function getDatabase(app){
  return app;
}

export function ref(db, table){
  return {
    db,
    table
  }
}

export function set(ref, data){
  return {
    ref,
    data
  }
}

export function onValue(ref, callback){
  return {
    ref,
    callback
  }
}

export function get(db){
  return {
    db,
    exists(){
      return true;
    }
  }
}

export function child(db, table){
  return {
    db,
    table
  }
}

export function update(ref, data){
  return {
    ref,
    data
  }
}