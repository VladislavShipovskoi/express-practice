const express = require("express");
const router = express.Router();
const fileUpload = require("../middleware/file");
const { uiApi, booksApi } = require("../api");

router.get("/", uiApi.index);
router.get("/book/create", uiApi.createForm);
router.post("/book/create", fileUpload.single("img"), uiApi.createFormSubmit);

module.exports = router;
