const express = require("express");
const router = express.Router();
const { fileUpload, isLoggedIn } = require("../../middleware");
const { uiApi, booksApi, authApi } = require("../../api");

router.get("/login", uiApi.login);
router.get("/register", uiApi.register);

router.post("/login", authApi.login);
router.post("/register", authApi.register);
router.get("/logout", authApi.logout);

router.get("/profile", isLoggedIn, uiApi.profile);

module.exports = router;
