import gameDatabase from "../database/database.js";
import gameStore from "../modules/game-store.js";
import { correctList } from "../modules/keywords.js";
import { DATABASE_KEYS, pickRandom, shuffleStrings, TABLE_KEYS } from "../modules/modules.js";
import {uiHandler} from "../handler/index.js";

class GameSetupService {
  createDefaultData = async () => {
    const data = await gameDatabase.getData(DATABASE_KEYS.GAME_DATA_KEY);

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

    gameStore.setDefaultGameInfos(newDatabase);

    const {category, myCorrect} = gameStore;
    uiHandler.updateGameInfoUI(category, myCorrect);

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