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

  let data = {
    title,
    description,
    authors,
    favorite,
  };

  if (req.files) {
    const fileCover = req.files["fileCover"];
    const fileBook = req.files["fileBook"];

    if (fileCover) {
      data.fileCover = fileCover[0].path;
    }

    if (fileBook) {
      data.fileName = fileBook[0].filename;
      data.fileBook = fileBook[0].path;
    }
  }

  newBook = new Book(
    data.title,
    data.description,
    data.authors,
    data.favorite,
    data.fileCover,
    data.fileName,
    data.fileBook,
  );

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

    if (req.files) {
      const fileCover = req.files["fileCover"];
      const fileBook = req.files["fileBook"];

      if (fileCover) {
        updateData.fileCover = fileCover[0].path;
      }

      if (fileBook) {
        updateData.fileName = fileBook[0].filename;
        updateData.fileBook = fileBook[0].path;
      }
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
