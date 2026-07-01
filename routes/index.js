const path = require("path");
const express = require("express");
const { fileUpload } = require("../middleware");
const { Book } = require("../entity");
const { books: booksStore } = require("../store");

const router = express.Router();

router.get("/api/user/login", (req, res) => {
  res.status(201);
  res.json({ id: 1, mail: "test@mail.ru" });
});

router.get("/api/books", (req, res) => {
  const { books } = booksStore;
  res.json(books);
});

router.get("/api/books/:id", (req, res) => {
  const { books } = booksStore;
  const { id } = req.params;
  const book = books.find((book) => book.id === id);

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

router.get("/api/books/:id/download", (req, res) => {
  const { books } = booksStore;
  const { id } = req.params;
  const book = books.find((book) => book.id === id);

  if (book) {
    res.download(`${book.fileBook}`, book.fileName, (error) => {
      console.log(error);
      res.status(404).json();
    });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

router.post("/api/books", fileUpload.single("img"), (req, res) => {
  const { books } = booksStore;
  const { title, description, authors, favorite, fileCover, fileName } =
    req.body;
  let newBook = {};

  if (req.file) {
    const { path, filename } = req.file;

    newBook = new Book(
      title,
      description,
      authors,
      favorite,
      fileCover,
      filename,
      path,
    );
  } else {
    newBook = new Book(
      title,
      description,
      authors,
      favorite,
      fileCover,
      fileName,
    );
  }

  books.push(newBook);
  res.status(201);
  res.json(newBook);
});

router.put("/api/books/:id", fileUpload.single("img"), (req, res) => {
  const { books } = booksStore;
  const { id } = req.params;
  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex !== -1) {
    const { id: _, ...bodyData } = req.body;

    const updateData = bodyData;

    if (req.file) {
      const { path, filename } = req.file;
      updateData.fileName = filename;
      updateData.fileBook = path;
    }

    books[bookIndex] = {
      ...books[bookIndex],
      ...updateData,
    };

    res.json(books[bookIndex]);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

router.delete("/api/books/:id", (req, res) => {
  const { books } = booksStore;
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

module.exports = router;
