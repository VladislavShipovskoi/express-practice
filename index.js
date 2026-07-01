const express = require("express");
const { logger, error404 } = require("./middleware");
const books = require("./routes");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(logger);
app.use("/", books);
app.use(error404);

app.listen(PORT, () => {
  console.log(`Library app listening on port ${PORT}`);
});
