const fs = require("fs");
const os = require("os");

module.exports = (req, res, next) => {
  const { url, method } = req;
  const dateNow = Date.now();
  const data = `${dateNow} ${method} ${url}`;

  fs.appendFile("server.log", data + os.EOL, (error) => {
    if (error) throw error;
  });

  next();
};
