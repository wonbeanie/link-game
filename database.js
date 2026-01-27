import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get, child, update} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { firebaseConfig } from "./config.js";
import { DATABASE_KEYS } from "./modules.js";

class GameDatabase {
  app = null;
  db = null;
  dbRef = null;

  constructor(){
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
    this.dbRef = ref(getDatabase());
  }

  updateData(data, table = DATABASE_KEYS.GAME_DATA_KEY) {
    update(ref(this.db, table), data);
  }
  
  clearDatabase() {
    set(ref(this.db, DATABASE_KEYS.ROOT_KEY), null);
  }

  onValueListener(key, callback){
    onValue(ref(this.db, key), (snapshot)=>{
      const data = snapshot.val();
      if(null === data){
        return;
      }
      callback(data);
    });
  }

  async getData(key){
    const snapshot = await get(child(this.dbRef, key))

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return {};
  }
}

const gameDatabase = new GameDatabase();
export default gameDatabase;