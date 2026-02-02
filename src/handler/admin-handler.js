import gameDatabase from "../database/database.js";
import gameData from "../modules/game-data.js";
import gameElements from "../modules/game-elements.js";
import { correctList } from "../modules/keywords.js";
import { DATABASE_KEYS, pickRandom, shuffleStrings, TABLE_KEYS } from "../modules/modules.js";

class AdminHandler {

  start = () => {
    gameDatabase.getData(DATABASE_KEYS.GAME_DATA_KEY).then((data) => {
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

      let result = this.gameInit();

      const shuffleList = shuffleStrings(list);

      gameData.suspect = pickRandom(shuffleList);

      const {suspect, category, fakeCorrect, isSuspect, correct} = gameData;
      result[TABLE_KEYS.SEQUENCE] = shuffleList;
      result[TABLE_KEYS.SUSPECT] = suspect;

      gameElements.info.category.textContent = category;
      
      if(isSuspect){
        gameElements.info.correct.textContent = fakeCorrect;
      }
      else {
        gameElements.info.correct.textContent = correct;
      }

      gameDatabase.updateData(result);
    });

    gameDatabase.clearDatabase();
    let result = {};
    result[TABLE_KEYS.START] = `Start Game${new Date().getTime()}`
    gameDatabase.updateData(result);
  }

  clear = () => {
    gameDatabase.clearDatabase();
  }

  gameInit = () => {
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

    let result = {};

    result[TABLE_KEYS.CATEGORY] = category;
    result[TABLE_KEYS.CORRECT] = correct;
    result[TABLE_KEYS.FAKE_CORRECT] = fakeCorrect;

    gameData.category = category;
    gameData.correct = correct;
    gameData.fakeCorrect = fakeCorrect;

    return result;
  }
}

const adminHandler = new AdminHandler();
export default adminHandler;