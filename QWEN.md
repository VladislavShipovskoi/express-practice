# QWEN.md — express-practice

Instructional context for AI agents working in this repository. Read the code before relying
on this file; it describes structure and conventions, not every implementation detail.

## Project Overview

A learning sandbox for the Express ecosystem (see `README.md`), implemented as a **"Library"**
app: books are stored in MongoDB and exposed through both a server-rendered UI and a JSON API.

Main technologies:

| Concern         | Choice                                                     |
| --------------- | ---------------------------------------------------------- |
| HTTP framework  | Express **5.x** (`express@^5.2.1`)                         |
| Views           | EJS **6.x**, layout pattern, Tailwind via CDN — no bundler |
| Data store      | MongoDB via Mongoose **9.x**                               |
| Auth            | `passport` + `passport-local` + `passport-local-mongoose`  |
| Sessions        | `express-session` persisted in **Redis** (`connect-redis`) |
| Realtime        | `socket.io` **4.x** — per-book discussion chat             |
| Uploads         | `multer` **2.x** disk storage                              |
| Side service    | `counter-service/` — Redis page-view counter over HTTP     |
| Runtime         | CommonJS (`"type": "commonjs"`), Node 22 (image) / 24 (dev) |
| Containers      | Docker Compose (three variants)                            |

Two independently installed npm packages live in this repo: the root app and
`counter-service/` (its own `package.json`, `Dockerfile`, and `.gitignore`).

### Request flow / layering

```
index.js  →  routes/**  →  api/**  →  models/**
 bootstrap    routers only  handlers   Mongoose

middleware/**  cross-cutting: guards, logging, uploads, error handlers
```

- **`index.js`** — bootstrap only: creates the app, `node:http` server, and socket.io `Server`;
  configures the Redis client + `RedisStore` session; registers the Passport `LocalStrategy` and
  serialize/deserialize; applies the middleware pipeline; mounts routers; registers `error404`
  and `error` last; defines the `io.on("connection")` handlers; and runs `start()`, which
  connects MongoDB → connects Redis → `server.listen()`, calling `process.exit(1)` on failure.
- **`routes/`** — thin routers. No business logic: they compose guards, upload middleware, and
  handlers from `api/`.
- **`api/`** — all handlers, in several flavours:
  - **data layer** (`api/books.js`): `getAllBase`, `getByIdBase`, `createBase`, `updateBase`,
    `deleteByIdBase` — shared by the JSON handlers in the *same file* and by the view renderers
    in `api/ui.js`.
  - **JSON handlers** (`api/books.js`): `getAll`, `getById`, `downloadById`, `create`, `update`,
    `deleteById`.
  - **UI handlers** (`api/ui.js`): `res.render("main", { title, content, ...locals })`.
  - **auth handlers** (`api/auth.js`): `login`, `register`, `logout` (redirect-based).
- **`models/`** — `Book`, `User`, `Comment`, re-exported from `models/index.js`.
- **`middleware/`** — one guard/helper per file, re-exported from `middleware/index.js`.

## Directory Map

```
index.js                     app + server + socket.io bootstrap
api/                         handlers: auth.js, books.js (data + JSON), ui.js (renders)
routes/
  ui/user.router.js          /login /register /logout /profile
  ui/book.router.js          /  /book/create  /book/:id[/update|/delete]  (router.use(isLoggedIn))
  api/book/book.router.js    /api/books[/:id[/download]]  (per-route isApiAuthenticated)
models/                      book.js  user.js  comment.js  index.js
middleware/                  logger  isLoggedIn  isLoggedOut  isApiAuthenticated
                             file (multer)  error404  error  index
views/
  main.ejs                   layout: navbar + <%- include(content) %>
  books/{list,form,view}.ejs view.ejs holds the Socket.IO chat client (inline <script>)
  user/{login,register,profile}.ejs
  errors/404.ejs
public/                      served at "/public"; uploads land in public/img
data/                        Redis persistence volume (./data:/data)
counter-service/             separate Express app: GET /counter/:bookId, POST /counter/:bookId/incr
```

## Building and Running

### Prerequisites (both are mandatory)

MongoDB **and** Redis must be reachable before the app starts — `start()` exits the process if
either connection fails. Redis is not optional even for pure HTTP work: the session store is
`connect-redis`, so `/login` and every authenticated page need it.

Fastest path to a working environment is the dev compose file, which starts Mongo, Redis,
mongo-express, and both Node services:

```bash
docker compose -f docker-compose-dev.yaml up
```

### Local commands (root package)

```bash
npm install
npm run dev         # nodemon -L --env-file=.env index.js   (requires a .env file to exist)
npm run server      # node index.js                         (set env vars yourself)
npm run dev-docker  # nodemon -L index.js                   (used inside containers)
```

### Counter service

```bash
cd counter-service
npm install
npm run dev         # nodemon -L
npm run server      # node index.js
```

### Docker

| Command                                           | What it does                                                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `docker compose -f docker-compose-dev.yaml up`     | Bind-mounts `./` and `./counter-service`, runs nodemon, hot reload                       |
| `docker compose -f docker-compose-build.yaml up`   | Builds both images from local `Dockerfile`s (`build: .`, `build: ./counter-service`)     |
| `docker compose up`                                | Runs published images `vladislavshipovkoi/library:v1.0.0` and `vladislavshipovkoi/library:counter` |

Services in all three files: `library` (`80:3000`), `counter` (`3001:3001`), `mongo`,
`mongo-express` (`8081:8081`, admin UI), `storage` (Redis, with `./data` volume-mounted).
Startup ordering is enforced identically in all three: `mongo` and `storage` define
`healthcheck`s, and `library`/`counter` gate on them with
`depends_on: { <svc>: { condition: service_healthy } }`. `library` waits only for
`service_started` on `counter`, because the counter is best-effort (`api/ui.js` sets
`count = null` when it is unreachable). Keep the three files in sync when editing any of them.

### Tests

**There is no test suite.** `npm test` in both packages is the scaffolding stub
`echo "Error: no test specified" && exit 1`. Verify changes manually: start the stack, register
a user, then exercise the UI, the JSON API, and the chat (open two browsers/users in the same
book room to see realtime fan-out).

### Environment variables

| Variable              | Default (code)                  | Used by                       | Notes                                                                |
| --------------------- | ------------------------------- | ----------------------------- | -------------------------------------------------------------------- |
| `PORT`                | `3000` (app) / `3001` (counter) | `index.js`, counter service   | Compose sets both explicitly                                          |
| `DB_URL`              | **none — must be provided**     | `index.js` (Mongoose)         | e.g. `mongodb://root:example@mongo:27017`                             |
| `REDIS_URL`           | `redis://localhost:6379`        | `index.js` (sessions)         | Compose: `redis://storage`; the counter service defaults to `redis://localhost` |
| `SECRET`              | `"TEST_SECRET"`                 | `index.js` (session secret)   | The variable is `SECRET`, not `SESSION_SECRET`                        |
| `COUNTER_SERVICE_URL` | `http://localhost:3001`         | `api/ui.js`                   | Compose: `http://counter:3001`                                        |

There is **no** `.env.example`, and `.env` is gitignored — so `npm run dev` fails on a fresh
clone until you create that file.

## Development Conventions

These are inferred from the existing code — match them rather than introducing parallel patterns.

### Module style

- CommonJS everywhere: `require` / `module.exports`.
- Import through the folder barrel, never a deep path:
  `require("./models")`, `require("../../middleware")`, `require("../../api")`.
- New models, middleware, and handlers must be added to that folder's `index.js` export.
- `passport-local-mongoose` is imported with `.default`
  (`require("passport-local-mongoose").default`) — keep that interop shim.
- Node built-ins use the `node:` prefix (`require("node:http")`).

### Routes and handlers

- Routers follow `const router = express.Router()` → route definitions → `module.exports = router`.
- Keep route files declarative; logic belongs in `api/`.
- Reuse the `*Base` functions from `api/books.js` so the JSON API and the EJS UI cannot drift.
- DB access is Mongoose only (`find().select("-__v")`, `findById`, `findByIdAndUpdate`, `deleteOne`).
- The book `id` used in URLs, rooms, and counter keys is the virtual `doc.id`, not `_id`.

### Auth guards

- UI route groups: `router.use(isLoggedIn)` → redirects to `/login`. It also stores
  `req.session.returnTo = req.originalUrl`, which **nothing currently reads back** — do not rely
  on a post-login return.
- API routes: `isApiAuthenticated` per route → `401` JSON `{ error, message }` (message is Russian).
- `isLoggedOut` exists for guest-only routes but is not wired into any router today.
- The Passport strategy and serialization live only in `index.js`; handlers in `api/auth.js` use
  `passport.authenticate("local", { successRedirect, failureRedirect })` plus `req.login` / `req.logout`.

### Views and front end

- Always render the `main` layout with `{ title, content, ...locals }`, where `content` is the
  partial path (`"books/list"`, `"errors/404"`); `views/main.ejs` includes it.
- Pass `hideNavbar: true` for auth pages (`login`, `register`).
- `currentUser` is available in every template via `res.locals.currentUser` (set in `index.js`);
  the navbar and the chat depend on it.
- Missing documents render `errors/404` through `main` rather than sending a bare status code.
- Styling is utility-class Tailwind from the `@tailwindcss/browser@4` CDN — no CSS build step.
- Client JS is inline `<script>` in the view (see `views/books/view.ejs`); the socket.io client is
  auto-served at `/socket.io/socket.io.js`, and the connection uses `io({ withCredentials: true })`.
- UI copy mixes Russian and English (navbar, chat, 401 message are Russian) — follow the file you
  are editing.

### Uploads and files

- Uploads use `fileUpload.fields([{ name: "fileCover", maxCount: 1 }, { name: "fileBook", maxCount: 1 }])`.
- `multer.diskStorage` writes to **`public/img`** (relative to the process CWD) as
  `${Date.now()}-${file.originalname}`; that directory must exist at runtime.
- The stored DB value is a project-relative path (`public/img/...`); templates prefix it with `/`
  (`/<%= book.fileCover %>`), served by `app.use("/public", express.static(__dirname + "/public"))`.
  `fileName` holds the original name and is used by `res.download`.

### Models

- Schemas stay minimal and permissive (mostly plain `String` fields on `Book`).
- `User` declares `username`/`email` as unique + required, and applies `passportLocalMongoose`,
  which supplies `authenticate`, `serializeUser`, `deserializeUser`, and `User.register`.
- `Comment` denormalises `username` alongside the `userId`/`bookId` refs and indexes `bookId`.

### Realtime (Socket.IO)

- Room naming: **`book_${bookId}`**, joined when the client emits `joinBookRoom`.
- Events: `joinBookRoom` → emits `getComments` (last 100, `createdAt` ascending, `.lean()`);
  `comment` → saves a `Comment` and broadcasts `newComment` to the room.
- Session and Passport are applied to socket handshakes with
  `io.engine.use(sessionMiddleware)` + `passport.initialize()` + `passport.session()`;
  handlers read the user from `socket.request.user`.
- Payload shape shared by history and live messages: `{ user, text, time }`, where `time` is a
  locale-formatted `HH:MM` string built server-side.
- The client renders with `document.createElement` + `textContent` (no HTML string injection) —
  keep user content out of `innerHTML`.

### Formatting and tooling

- Prettier defaults are in effect (double quotes, 2-space indent, trailing commas), but Prettier is
  **not** a dependency and there is no config file — formatting comes from the editor.
- `.prettierignore` excludes `*.ejs` and `views/**/*.ejs`: leave the existing indentation in
  templates alone rather than reformatting them.
- `.dockerignore` excludes `counter-service`, `node_modules`, `.git`, `*.log`, `*.env`, `*.txt`,
  so the root image contains only the main app.
- Gitignored artifacts: `node_modules`, `.env`, `server.log`, `data/dump.rdb`. The access logger
  appends to `server.log` in the CWD, so never commit it.
- Comments are sparse and in English, with no JSDoc blocks — match that.

### Error handling

- `middleware/logger` runs before the routes; `error404` and then the 4-argument `error` handler
  run after them, in that order, in `index.js`. Preserve this ordering when touching the pipeline.
- The JSON error handler replies with status 500 and `{ error: err.message }`.
- The counter service is best-effort: `api/ui.js` wraps its `fetch` calls in `try/catch` and sets
  `count = null` on failure, so the book page still renders when the side service is down.
