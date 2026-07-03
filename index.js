const express = require("express");
const { logger, error404, error } = require("./middleware");
const { userRouter, booksRouter, uiRouter } = require("./routes");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.set("view engine", "ejs");
app.use(logger);
app.use("/public", express.static(__dirname + "/public"));
app.use("/", uiRouter);
app.use("/api/user", userRouter);
app.use("/api/books", booksRouter);
app.use(error404);
app.use(error);

app.listen(PORT, () => {
  console.log(`Library app listening on port ${PORT}`);
});
