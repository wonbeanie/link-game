import { deepCopy } from "./modules.js";

export function updateTable(table, newData){
  if(!table){
    return newData;
  }

  let newTableData = deepCopy(table);

  for (const [key, value] of Object.entries(newData)){
    if(value === null){
      delete newTableData[key];
      continue;
    }

    if(Object.getPrototypeOf(value) === Object.prototype){
      const nextValue = {};

      Object.entries(value).forEach(([subKey, subValue]) => {
        if(subValue === null){
          delete newTableData[key][subKey];
          return;
        }

        nextValue[subKey] = subValue;
      });
      newTableData = {
        ...newTableData,
        [key] : {
          ...newTableData[key],
          ...nextValue
        }
      }
    }
    else {
      newTableData = {
        ...newTableData,
        [key] : value
      }
    }
  }

  return newTableData;
}
