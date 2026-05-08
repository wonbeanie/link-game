// lightdb-loader.js

/** @type {Promise<import('@wonbeanie/lightdb').LightDB>} */
const lightDBPromise = import("https://esm.sh/@wonbeanie/lightdb@2.0.0")
  .then((module) => {
    const LightDBClass =
      module.LightDB ||
      module.default?.LightDB ||
      module.default;

    return new LightDBClass();
  });

export default lightDBPromise;