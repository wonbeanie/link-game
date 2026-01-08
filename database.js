import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get, child, update} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { firebaseConfig } from "./config.js";

export default function GameDatabase() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const dbRef = ref(getDatabase());
  const GAME_DATA_KEY = "GameData/";
  const CHAT_DATA_KEY = "Chat/";
  const ROOT_KEY = "/";

  function updateData(data, table = GAME_DATA_KEY) {
    update(ref(db, table), data);
  }
  
  function clearDatabase() {
    set(ref(db, ROOT_KEY), null);
  }

  function onValueListener(key, callback){
    onValue(ref(db, key), (snapshot)=>{
      const data = snapshot.val();
      if(null === data){
        return;
      }
      callback(data);
    });
  }

  async function getData(key){
    const snapshot = await get(child(dbRef, key))

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return {};
  }

  return {
    "KEY" : {
      GAME_DATA_KEY,
      CHAT_DATA_KEY,
      ROOT_KEY
    },
    updateData,
    clearDatabase,
    onValueListener,
    getData
  }
}