const express = require("express");
const router = express.Router();

const { authApi } = require("../../../api");

router.post("/login", authApi.login);
router.post("/register", authApi.register);

module.exports = router;
