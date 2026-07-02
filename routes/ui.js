const express = require("express");
const router = express.Router();
const fileUpload = require("../middleware/file");
const { uiApi } = require("../api");

router.get("/", uiApi.index);
