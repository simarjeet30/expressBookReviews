const express = require("express");
const axios = require("axios");

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  users.push({ username, password });

  return res.status(200).json({
    message:
      "User successfully registered. Now you can login",
  });
});

// Get all books using Async/Await
public_users.get("/", async (req, res) => {
  try {
    const getAllBooks = new Promise(
      (resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject("Unable to retrieve books");
        }
      }
    );

    const allBooks = await getAllBooks;

    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({
      message: err,
    });
  }
});

// Get book details based on ISBN using Promises
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];

    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  })
    .then((book) =>
      res.status(200).json(book)
    )
    .catch((err) =>
      res.status(404).json({
        message: err,
      })
    );
});

// Get book details based on author using Async/Await
public_users.get(
  "/author/:author",
  async (req, res) => {
    const author = req.params.author;

    try {
      const booksByAuthor =
        await new Promise(
          (resolve, reject) => {
            const filtered = {};

            Object.keys(books).forEach(
              (key) => {
                if (
                  books[
                    key
                  ].author.toLowerCase() ===
                  author.toLowerCase()
                ) {
                  filtered[key] =
                    books[key];
                }
              }
            );

            if (
              Object.keys(filtered)
                .length > 0
            ) {
              resolve(filtered);
            } else {
              reject(
                "No books found for this author"
              );
            }
          }
        );

      return res.status(200).json({
        booksByAuthor,
      });
    } catch (err) {
      return res.status(404).json({
        message: err,
      });
    }
  }
);

// Get all books based on title using Async/Await
public_users.get(
  "/title/:title",
  async (req, res) => {
    const title = req.params.title;

    try {
      const booksByTitle =
        await new Promise(
          (resolve, reject) => {
            const filtered = {};

            Object.keys(books).forEach(
              (key) => {
                if (
                  books[
                    key
                  ].title.toLowerCase() ===
                  title.toLowerCase()
                ) {
                  filtered[key] =
                    books[key];
                }
              }
            );

            if (
              Object.keys(filtered)
                .length > 0
            ) {
              resolve(filtered);
            } else {
              reject(
                "No books found with this title"
              );
            }
          }
        );

      return res.status(200).json({
        booksByTitle,
      });
    } catch (err) {
      return res.status(404).json({
        message: err,
      });
    }
  }
);

// Get book review
public_users.get(
  "/review/:isbn",
  (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
      return res.status(200).json({
        reviews: book.reviews,
      });
    } else {
      return res.status(404).json({
        message: "Book not found",
      });
    }
  }
);

module.exports.general = public_users;
