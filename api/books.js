const { books: booksStore } = require("../store");
const { fileUpload } = require("../middleware");
const { Book } = require("../entity");

const getAll = (req, res) => {
  const { books } = booksStore;
  res.json(books);
};

const getById = (req, res) => {
  const { books } = booksStore;
  const { id } = req.params;
  const book = books.find((book) => book.id === id);

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
};

const downloadById = (req, res) => {
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
};

const createBase = (req) => {
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

  return newBook;
};

const create = (req, res) => {
  const { books } = booksStore;
  const newBook = createBase(req);
  books.push(newBook);
  res.status(201);
  res.json(newBook);
};

const updateBase = (req, res, callbackSuccess, callbackError) => {
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

    callbackSuccess(books[bookIndex], bookIndex);
  } else {
    callbackError();
  }
};

const update = (req, res) => {
  const { books } = booksStore;

  updateBase(
    req,
    res,
    (book, bookIndex) => {
      res.json(books[bookIndex]);
    },
    () => {
      res.status(404).json({ message: "Book not found" });
    },
  );
};

const deleteByIdBase = (req, res, callbackSuccess, callbackError) => {
  const { books } = booksStore;
  const { id } = req.params;
  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    callbackSuccess();
  } else {
    callbackError();
  }
};

const deleteById = (req, res) => {
  const { books } = booksStore;

  deleteBase(
    req,
    res,
    () => {
      res.status(200);
      res.json({ status: "ok" });
    },
    () => res.status(404).json({ message: "Book not found" }),
  );
};

module.exports = {
  getAll,
  getById,
  downloadById,
  createBase,
  create,
  updateBase,
  update,
  deleteByIdBase,
  deleteById,
};
