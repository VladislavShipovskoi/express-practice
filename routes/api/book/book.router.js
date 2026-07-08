const path = require("path");
const express = require("express");
const { booksApi } = require("../../../api");
const { fileUpload } = require("../../../middleware");

const router = express.Router();

router.get("/", booksApi.getAll);

router.get("/:id", booksApi.getById);

router.get("/:id/download", booksApi.downloadById);

router.post(
  "/",
  fileUpload.fields([
    { name: "fileCover", maxCount: 1 },
    { name: "fileBook", maxCount: 1 },
  ]),
  booksApi.create,
);

router.put(
  "/:id",
  fileUpload.fields([
    { name: "fileCover", maxCount: 1 },
    { name: "fileBook", maxCount: 1 },
  ]),
  booksApi.update,
);

router.delete("/:id", booksApi.deleteById);

module.exports = router;
