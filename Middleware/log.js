const fs = require('fs');
const path = require('path');

const logger = (req, res, next) => {
  const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync(path.join(__dirname, '../logs.txt'), log);
  next();
};

module.exports = logger;
