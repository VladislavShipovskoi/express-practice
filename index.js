const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const User = require("./models/User");
const { logger, error404, error } = require("./middleware");
const { apiBookRouter, uiUserRouter, uiBookRouter } = require("./routes");

const app = express();

const { createServer } = require("node:http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection", (socket) => {
  const { id } = socket;
  console.log("connection: " + id);

  socket.on("joinBookRoom", (bookId) => {
    socket.join(`book_${bookId}`);
  });

  socket.on("comment", ({ bookId, user, text }) => {
    const payload = {
      user: user,
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    io.to(`book_${bookId}`).emit("newComment", payload);
  });

  socket.on("disconnect", () => {
    console.log("disconnect: " + id);
  });
});

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET || "TEST",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(logger);
app.use("/public", express.static(__dirname + "/public"));

app.use("/", uiUserRouter);
app.use("/", uiBookRouter);
app.use("/api/books", apiBookRouter);
app.use(error404);
app.use(error);

async function start(PORT, DB_URL) {
  try {
    await mongoose.connect(DB_URL);
    server.listen(PORT, () => {
      console.log(`Library app listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;
start(PORT, DB_URL);
