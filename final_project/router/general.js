const express = require("express");
const axios = require("axios"); // available in the project; async HTTP client

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Task 6 – Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required.",
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists!",
    });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: "User successfully registered. Now you can login",
  });
});

/* ===========================================================
   Tasks 10–13: retrieve books using Promises / async-await
   =========================================================== */

// Task 10 – Get the complete list of books (async/await + Promise)
public_users.get("/", async (req, res) => {
  try {
    const getAllBooks = () =>
      new Promise((resolve) => resolve(books));

    const allBooks = await getAllBooks();

    return res
      .status(200)
      .send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving the book list",
    });
  }
});

// Task 11 – Get book details based on ISBN (Promise callbacks)
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];

    if (book) {
      resolve(book);
    } else {
      reject(
        new Error("Book not found for the given ISBN")
      );
    }
  })
    .then((book) => res.status(200).json(book))
    .catch((err) =>
      res.status(404).json({
        message: err.message,
      })
    );
});

// Task 12 – Get book details based on Author (async/await + Promise)
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author;

    const getByAuthor = () =>
      new Promise((resolve) => {
        const result = Object.keys(books)
          .map((isbn) => ({
            isbn,
            ...books[isbn],
          }))
          .filter(
            (book) =>
              book.author.toLowerCase() ===
              author.toLowerCase()
          );

        resolve(result);
      });

    const matches = await getByAuthor();

    if (matches.length > 0) {
      return res.status(200).json(matches);
    }

    return res.status(404).json({
      message:
        "No books found for the given author",
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error retrieving books by author",
    });
  }
});

// Task 13 – Get book details based on Title (async/await + Promise)
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;

    const getByTitle = () =>
      new Promise((resolve) => {
        const result = {};

        Object.keys(books).forEach((isbn) => {
          if (
            books[isbn].title.toLowerCase() ===
            title.toLowerCase()
          ) {
            result[isbn] = books[isbn];
          }
        });

        resolve(result);
      });

    const booksByTitle = await getByTitle();

    return res.status(200).json({
      booksByTitle,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error retrieving books by title",
    });
  }
});

// Task 5 – Get the book reviews based on ISBN
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  }

  return res.status(404).json({
    message: "Book not found",
  });
});

module.exports.general = public_users;
