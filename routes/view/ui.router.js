const express = require("express");
const router = express.Router();
const { fileUpload } = require("../../middleware");
const { uiApi, booksApi } = require("../../api");

router.get("/", uiApi.index);
router.get("/login", uiApi.login);
router.get("/register", uiApi.register);
router.get("/profile", uiApi.profile);
router.get("/logout", uiApi.logout);

router.get("/book/create", uiApi.createForm);

router.post(
  "/book/create",
  fileUpload.fields([
    { name: "fileCover", maxCount: 1 },
    { name: "fileBook", maxCount: 1 },
  ]),
  uiApi.createFormSubmit,
);

router.get("/book/:id/update", uiApi.updateForm);
router.post(
  "/book/:id/update",
  fileUpload.fields([
    { name: "fileCover", maxCount: 1 },
    { name: "fileBook", maxCount: 1 },
  ]),
  uiApi.updateFormSubmit,
);
router.get("/book/:id", uiApi.view);
router.get("/book/:id/delete", uiApi.deleteById);

module.exports = router;
