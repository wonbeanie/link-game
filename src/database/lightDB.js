/** @type {import('@wonbeanie/lightdb').LightDB} */
// let lightDB;

// try {
//   const module = await import("https://esm.sh/@wonbeanie/lightdb@1.0.2");
//   const LightDBClass = module.LightDB || (module.default && module.default.LightDB) || module.default;
//   lightDB = new LightDBClass();
// }
// catch(err){
//   console.log(err);
// }

import { LightDB } from "@wonbeanie/lightdb";

const lightDB = new LightDB();

export default lightDB;
