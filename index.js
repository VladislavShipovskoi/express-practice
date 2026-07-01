const express = require("express");
const { v4: uuid } = require("uuid");

const PORT = process.env.PORT || 3000;

class Book {
  constructor(
    title = "",
    description = "",
    authors = "",
    favorite = "",
    fileCover = "",
    fileName = "",
    id = uuid(),
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.authors = authors;
    this.favorite = favorite;
    this.fileCover = fileCover;
    this.fileName = fileName;
  }
}

const store = {
  books: [],
};

const app = express();
app.use(express.json());

app.get("/api/user/login", (req, res) => {
  res.status(201);
  res.json({ id: 1, mail: "test@mail.ru" });
});

app.get("/api/books", (req, res) => {
  const { books } = store;
  res.json(books);
});

app.get("/api/books/:id", (req, res) => {
  const { books } = store;
  const { id } = req.params;
  const book = books.find((book) => book.id === id);

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

app.post("/api/books", (req, res) => {
  const { books } = store;
  const { title, description, authors, favorite, fileCover, fileName } =
    req.body;

  const newBook = new Book(
    title,
    description,
    authors,
    favorite,
    fileCover,
    fileName,
  );

  books.push(newBook);
  res.status(201);
  res.json(newBook);
});

app.put("/api/books/:id", (req, res) => {
  const { books } = store;
  const { id } = req.params;
  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex !== -1) {
    const { id: _, ...updateData } = req.body;
    books[bookIndex] = {
      ...books[bookIndex],
      ...updateData,
    };

    res.json(books[bookIndex]);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

app.delete("/api/books/:id", (req, res) => {
  const { books } = store;
  const { id } = req.params;
  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    res.status(200);
    res.json({ status: "ok" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Library app listening on port ${PORT}`);
});
