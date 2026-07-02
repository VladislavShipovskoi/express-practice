const express = require("express");
const router = express.Router();
const fileUpload = require("../middleware/file");
const { uiApi, booksApi } = require("../api");

router.get("/", uiApi.index);

module.exports = router;
