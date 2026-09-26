// imports
const { createServer } = require("node:http");
const express = require("express");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");

// local imports
const { User, Comment } = require("./models");
const { logger, error404, error } = require("./middleware");
const { apiBookRouter, uiUserRouter, uiBookRouter } = require("./routes");

// configs and virtual env variables
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const SESSION_SECRET = process.env.SECRET || "TEST_SECRET";

// initialize
const app = express();
const server = createServer(app);
const io = new Server(server);
const redisClient = createClient({ url: REDIS_URL });

// passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// redis
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient, prefix: "session:" }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false,
    sameSite: true,
  },
});

// socket.io
io.engine.use(sessionMiddleware);
io.engine.use(passport.initialize());
io.engine.use(passport.session());

// middleware pipeline
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + "/public"));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// global variables for ejs templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(logger);

// routes
app.use("/", uiUserRouter);
app.use("/", uiBookRouter);
app.use("/api/books", apiBookRouter);

// error handlers
app.use(error404);
app.use(error);

// socket.io
io.on("connection", (socket) => {
  socket.on("joinBookRoom", async (bookId) => {
    socket.join(`book_${bookId}`);

    try {
      const comments = await Comment.find({ bookId })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      socket.emit(
        "getComments",
        comments.map((c) => ({
          user: c.username,
          text: c.text,
          time: new Date(c.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      );
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  });

  socket.on("comment", async ({ bookId, text }) => {
    const user = socket.request.user;
    if (!user || !bookId || !text?.trim()) return;

    try {
      const comment = new Comment({
        bookId,
        username: user.username,
        text: text.trim(),
        userId: user._id,
      });
      await comment.save();

      const payload = {
        user: comment.username,
        text: comment.text,
        time: new Date(comment.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      io.to(`book_${bookId}`).emit("newComment", payload);
    } catch (error) {
      console.error("saving error:", error);
      socket.emit("error", "Ошибка сохранения комментария");
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

async function start() {
  try {
    await mongoose.connect(DB_URL);
    console.log("MongoDB connected successfully");

    await redisClient.connect();
    console.log("Redis connected successfully");

    server.listen(PORT, () => {
      console.log(`Library app listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
