import fs from 'fs';

/**
 *
 * @param {string[]} dirnames
 */
export const mkdirIfNotExists = (...dirnames) => {
  dirnames.forEach(dirname =>
    fs.existsSync(dirname) ? null : fs.mkdirSync(dirname)
  );
};
