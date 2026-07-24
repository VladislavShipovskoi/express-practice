const { books: booksStore } = require("../store");
const {
  getAllBase,
  getByIdBase,
  createBase,
  deleteByIdBase,
  updateBase,
} = require("./books");
const BookModel = require("../models/Book");

const COUNTER_SERVICE_URL =
  process.env.COUNTER_SERVICE_URL || "http://localhost:3001";

const index = async (req, res) => {
  const books = await getAllBase();

  res.render("main", {
    title: "Book List",
    content: "books/list",
    books: books,
  });
};

const updateForm = async (req, res) => {
  const bookId = req.params.id;
  const book = await getByIdBase(bookId);

  if (!book)
    return res.render("main", {
      title: "Page Not Found",
      content: "errors/404",
    });

  res.render("main", {
    title: "Update Book",
    content: "books/form",
    book: book,
    action: `/book/${book.id}/update`,
    update: true,
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

const createFormSubmit = (req, res) => {
  const newBook = createBase(req);
  res.redirect("/");
};

const view = async (req, res) => {
  const bookId = req.params.id;
  const book = await getByIdBase(bookId);

  if (!book)
    return res.render("main", {
      title: "Page Not Found",
      content: "errors/404",
    });

  const renderContex = {
    title: "Book Details",
    content: "books/view",
    book: book,
  };

  try {
    await fetch(`${COUNTER_SERVICE_URL}/counter/${bookId}/incr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const getCountResponse = await fetch(
      `${COUNTER_SERVICE_URL}/counter/${bookId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    const data = await getCountResponse.json();
    renderContex.count = data.count;
  } catch (error) {
    renderContex.count = null;
  }

  res.render("main", renderContex);
};

const deleteById = (req, res) => {
  deleteByIdBase(
    req,
    res,
    () => {
      res.redirect("/");
    },
    () => {
      return res.render("main", {
        title: "Page Not Found",
        content: "errors/404",
      });
    },
  );
};

const updateFormSubmit = (req, res) => {
  updateBase(
    req,
    res,
    (book) => {
      res.redirect(`/book/${book.id}`);
    },
    () => {
      return res.render("main", {
        title: "Page Not Found",
        content: "errors/404",
      });
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
