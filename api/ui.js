const { books: booksStore } = require("../store");
const { Book } = require("../entity");
const { createBase, deleteByIdBase, updateBase } = require("./books");

const index = (req, res) => {
  const { books } = booksStore;

  res.render("main", {
    title: "Book List",
    content: "books/list",
    books: books,
  });
};

const createForm = (req, res) => {
  res.render("main", {
    title: "Create Book",
    content: "books/form",
    book: {},
    action: "/book/create",
  });
};

const updateForm = (req, res) => {
  const { books } = booksStore;
  const bookId = req.params.id;
  const book = books.find((book) => book.id === bookId);

  res.render("main", {
    title: "Update Book",
    content: "books/form",
    book: book,
    action: `/book/${book.id}/update`,
    update: true,
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
    title: "Book Details",
    content: "books/view",
    book: book,
  });
};

const deleteById = (req, res) => {
  deleteByIdBase(
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

const updateFormSubmit = (req, res) => {
  const { books } = booksStore;
  updateBase(
    req,
    res,
    (book) => {
      res.redirect(`/book/${book.id}`);
    },
    () => {
      res.status(404).json({ message: "Book not found" });
    },
  );
};

module.exports = {
  index,
  view,
  createForm,
  createFormSubmit,
  updateForm,
  updateFormSubmit,
  deleteById,
};
