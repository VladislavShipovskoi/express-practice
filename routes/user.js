const express = require("express");
const router = express.Router();

const { userApi } = require("../api");

router.get("/login", userApi.login);

module.exports = router;
