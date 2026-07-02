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

module.exports = { index };
