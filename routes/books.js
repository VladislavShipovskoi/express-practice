const path = require("path");
const express = require("express");
const { booksApi } = require("../api");
const { fileUpload } = require("../middleware");

const router = express.Router();

router.get("/", booksApi.getAll);

router.get("/:id", booksApi.getById);

router.get("/:id/download", booksApi.downloadById);

router.post("/", fileUpload.single("img"), booksApi.create);

router.put("/:id", fileUpload.single("img"), booksApi.update);

router.delete("/:id", booksApi.deleteById);

module.exports = router;
