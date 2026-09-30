const path = require("node:path");
const multer = require("multer");

const safeName = (originalname) => {
  const base = path
    .basename(String(originalname))
    .replace(/[\u0000-\u001f]/g, "");
  const rawExt = path.extname(base);
  const ext = rawExt.toLowerCase().slice(0, 10);
  const stem = base
    .slice(0, base.length - rawExt.length)
    .replace(/[^\p{L}\p{N}._-]/gu, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 100);

  return `${Date.now()}-${stem || "file"}${ext}`;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img");
  },
  filename: function (req, file, cb) {
    cb(null, safeName(file.originalname));
  },
});

module.exports = multer({ storage, defParamCharset: "utf8" });
module.exports.safeName = safeName;
