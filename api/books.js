const { books: booksStore } = require("../store");
const { fileUpload } = require("../middleware");
const { Book } = require("../models/");

const getAllBase = async () => {
  try {
    const books = await Book.find().select("-__v");
    return books;
  } catch (e) {
    throw e;
  }
};

const getByIdBase = async (id) => {
  try {
    const book = await BookModel.findById(id).select("-__v");
    return book;
  } catch (e) {
    throw e;
  }
};

const updateBase = async (req, res, callbackSuccess, callbackError) => {
  const { id } = req.params;

  try {
    const book = await getByIdBase(id);

    if (book.id) {
      const { id: _, ...bodyData } = req.body;

      if (req.files) {
        const fileCover = req.files["fileCover"];
        const fileBook = req.files["fileBook"];

        if (fileCover) {
          bodyData.fileCover = fileCover[0].path;
        }

        if (fileBook) {
          bodyData.fileName = fileBook[0].filename;
          bodyData.fileBook = fileBook[0].path;
        }
      }

      const updatedBook = await BookModel.findByIdAndUpdate(id, bodyData);
      callbackSuccess(updatedBook);
    } else {
      callbackError();
    }
  } catch (e) {
    throw e;
  }
};

const createBase = async (req) => {
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

  newBook = new Book({
    title: data.title,
    description: data.description,
    authors: data.authors,
    favorite: data.favorite,
    fileCover: data.fileCover,
    fileName: data.fileName,
    fileBook: data.fileBook,
  });

  try {
    await newBook.save();
    return newBook;
  } catch (e) {
    throw e;
  }
};

const deleteByIdBase = async (req, res, callbackSuccess, callbackError) => {
  const { id } = req.params;

  try {
    const book = await getByIdBase(id);

    if (book) {
      await BookModel.deleteOne({ _id: id });
      callbackSuccess();
    } else {
      callbackError();
    }
  } catch (e) {
    throw e;
  }
};

const getAll = async (req, res) => {
  try {
    const books = await getAllBase(req);
    res.json(books);
  } catch (e) {
    res.status(500).json(e);
  }
};

const getById = (req, res) => {
  const { id } = req.params;

  try {
    const book = getByIdBase(id);

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

const downloadById = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await getByIdBase(id);

    if (book) {
      res.download(`${book.fileBook}`, book.fileName, (error) => {
        res.status(404).json();
      });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

const create = (req, res) => {
  try {
    const newBook = createBase(req);
    res.status(201).json(newBook);
  } catch (e) {
    res.status(500).json(e);
  }
};

const update = (req, res) => {
  try {
    updateBase(
      req,
      res,
      (book) => {
        res.json(book);
      },
      () => {
        res.status(404).json({ message: "Book not found" });
      },
    );
  } catch (e) {
    res.status(500).json(e);
  }
};

const deleteById = (req, res) => {
  try {
    deleteByIdBase(
      req,
      res,
      () => {
        res.status(200);
        res.json({ status: "ok" });
      },
      () => res.status(404).json({ message: "Book not found" }),
    );
  } catch (e) {
    res.status(500).json(e);
  }
};

module.exports = {
  getAllBase,
  getByIdBase,
  updateBase,
  createBase,
  deleteByIdBase,
  getAll,
  getById,
  downloadById,
  update,
  create,
  deleteById,
};
