const express = require("express");
const router = express.Router();
const fileUpload = require("../middleware/file");
const { uiApi, booksApi } = require("../api");

router.get("/", uiApi.index);
router.get("/book/create", uiApi.createForm);
router.post("/book/create", fileUpload.single("img"), uiApi.createFormSubmit);
router.get("/book/:id/update", uiApi.updateForm);
router.post(
  "/book/:id/update",
  fileUpload.single("img"),
  uiApi.updateFormSubmit,
);
router.get("/book/:id", uiApi.view);
router.get("/book/:id/delete", uiApi.deleteById);
router.get("/404", uiApi.error404);

module.exports = router;
