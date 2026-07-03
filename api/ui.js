const { books: booksStore } = require("../store");
const { Book } = require("../entity");
const { createBase, deleteBase } = require("./books");

const index = (req, res) => {
  const { books } = booksStore;

  res.render("main", {
    title: "Library",
    content: "books/list",
    books: books,
  });
};

const createForm = (req, res) => {
  res.render("main", {
    title: "Create book",
    content: "books/create",
  });
};

const createFormSubmit = (req, res) => {
  const { books } = booksStore;
  const newBook = createBase(req);
  books.push(newBook);
  res.redirect("/");
};

const view = (req, res) => {
  const { books } = booksStore;
  const bookId = req.params.id;
  const book = books.find((book) => book.id === bookId);

  res.render("main", {
    title: "Book details",
    content: "books/view",
    book: book,
  });
};

const deleteById = (req, res) => {
  deleteBase(
    req,
    res,
    () => {
      res.redirect("/");
    },
    () => {
      res.status(404).json({ message: "Book not found" });
    },
  );
};

module.exports = { index, view, createForm, createFormSubmit, deleteById };
