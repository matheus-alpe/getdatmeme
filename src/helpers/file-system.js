const fs = require("fs");

/**
 *
 * @param {string[]} dirnames
 */
const mkdirIfNotExists = (...dirnames) => {
  dirnames.forEach((dirname) =>
    fs.existsSync(dirname) ? null : fs.mkdirSync(dirname)
  );
};

module.exports = {
  mkdirIfNotExists,
};
