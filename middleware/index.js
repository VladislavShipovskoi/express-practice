const error404 = require("./error404");
const logger = require("./logger");
const fileUpload = require("./file");
const error = require("./error");
const isLoggedIn = require("./isLoggedIn");
const isLoggedOut = require("./isLoggedOut");
const isApiAuthenticated = require("./isApiAuthenticated");

module.exports = {
  error404,
  logger,
  fileUpload,
  error,
  isLoggedIn,
  isLoggedOut,
  isApiAuthenticated,
};
