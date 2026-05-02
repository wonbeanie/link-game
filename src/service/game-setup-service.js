import gameDatabase from "../database/database.js";
import { correctList } from "../lib/keywords.js";
import { DATABASE_KEYS, pickRandom, shuffleStrings, TABLE_KEYS } from "../lib/modules.js";
import eventBus from "../lib/event-bus.js";
import { GameEvents } from "../lib/events.js";
import lightDB from "../database/lightDB.js";

class GameSetupService {
  createDefaultData = () => {
    const data = lightDB.database[DATABASE_KEYS.GAME_DATA_KEY];

    let list = [];

    if(!data){
      return;
    }

    Object.entries(data).forEach(([key, value]) => {
      if(key === TABLE_KEYS.START){
        return;
      }

      list.push(key);
    });

    const keywords = this.generateKeywords();
    const shuffleList = shuffleStrings(list);

    const newDatabase = {
      [TABLE_KEYS.SEQUENCE] : shuffleList,
      [TABLE_KEYS.SUSPECT] : pickRandom(shuffleList),
      [TABLE_KEYS.CATEGORY] : keywords.category,
      [TABLE_KEYS.CORRECT] : keywords.correct,
      [TABLE_KEYS.FAKE_CORRECT] : keywords.fakeCorrect
    };

    eventBus.emit(GameEvents.GAME_INFOS_UPDATE, newDatabase);

    return newDatabase;
  }

  generateKeywords = () => {
    const category = pickRandom(Object.keys(correctList));
    const correct = pickRandom(correctList[category]);

    let noCorrectList = [];

    correctList[category].forEach((data)=>{
      if(correct === data){
        return;
      }
      noCorrectList.push(data);
    });

    const fakeCorrect = pickRandom(noCorrectList);

    return {
      category,
      correct,
      fakeCorrect
    };
  }
}

const gameSetupService = new GameSetupService();
export default gameSetupService;