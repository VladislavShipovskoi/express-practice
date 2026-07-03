const { books: booksStore } = require("../store");
const { Book } = require("../entity");
const { createBase } = require("./books");

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

module.exports = { index, createForm, createFormSubmit };
