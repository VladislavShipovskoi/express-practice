const express = require("express");
const mongoose = require("mongoose");
const { logger, error404, error } = require("./middleware");
const { userRouter, bookRouter, uiRouter } = require("./routes");

const app = express();

app.use(express.json());
app.set("view engine", "ejs");
app.use(logger);
app.use("/public", express.static(__dirname + "/public"));
app.use("/", uiRouter);
app.use("/api/user", userRouter);
app.use("/api/books", bookRouter);
app.use(error404);
app.use(error);

async function start(PORT, DB_URL) {
  try {
    await mongoose.connect(DB_URL);
    app.listen(PORT, () => {
      console.log(`Library app listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;
start(PORT, DB_URL);
