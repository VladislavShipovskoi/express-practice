const path = require("path");
const express = require("express");
const { booksApi } = require("../../../api");
const { fileUpload, isApiAuthenticated } = require("../../../middleware");

const router = express.Router();

router.get("/", isApiAuthenticated, booksApi.getAll);

router.get("/:id", isApiAuthenticated, booksApi.getById);

router.get("/:id/download", isApiAuthenticated, booksApi.downloadById);

router.post(
  "/",
  isApiAuthenticated,
  fileUpload.fields([
    { name: "fileCover", maxCount: 1 },
    { name: "fileBook", maxCount: 1 },
  ]),
  booksApi.create,
);

router.put(
  "/:id",
  isApiAuthenticated,
  fileUpload.fields([
    { name: "fileCover", maxCount: 1 },
    { name: "fileBook", maxCount: 1 },
  ]),
  booksApi.update,
);

router.delete("/:id", isApiAuthenticated, booksApi.deleteById);

module.exports = router;
