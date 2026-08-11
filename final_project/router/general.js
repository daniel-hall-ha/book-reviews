const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const crypto = require('node:crypto');
const axios = require('axios')

// Router for public user and book-related routes.
const public_users = express.Router();

// Register a new user.
public_users.post("/register", (req, res) => {
  if (Object.keys(req.body).length !== 2 || Object.keys(req.body)[0] !== "username" || Object.keys(req.body)[1] !== "password")
    // Validate that the request body contains exactly username and password.
    return res.status(400).json({ message: "Invalid Payload" });

  if (!req.body.username)
    // Check whether the username was provided.
    return res.status(400).json({ message: "Username required" });

  if (!req.body.password)
    // Check whether the password was provided.
    return res.status(400).json({ message: "Password required" });

  if (users.find(user => user.username === req.body.username))
    // Check whether the username already exists.
    return res.status(400).json({ message: "User already exists" });

  users.push({
    // Add the new user to the users array.
    "uid": users.length + 1,
    "username": req.body.username,
    // Hash the password before storing it.
    "password": crypto.createHmac('sha256', process.env.SECRET_KEY).update(req.body.password).digest('hex')
  })
  // Return a successful registration response.
  return res.status(200).json({ message: "User registered successfully " })
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Convert the books object into an array containing the book information.
  const result = Object.entries(books).map(([isbn, detail]) => {
    return {
      isbn: isbn,
      title: detail.title,
      author: detail.author,
      reviews: detail.reviews
    };
  });
  // Set the response content type to JSON.
  res.type('json');
  // Return the formatted book list.
  return res.status(200).send(JSON.stringify(result, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Get the ISBN from the URL parameter.
  const isbn = req.params.isbn
  res.type('json')
  // Check whether the requested ISBN exists.
  if (books[isbn])
    return res.status(200).send(JSON.stringify({ [isbn]: books[isbn] }, null, 2));
  else
    // Return a 404 response when the book does not exist.
    return res.status(404).send({ messsage: "Book not found." })
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  // Get the author from the URL parameter.
  const author = req.params.author
  // Filter books by comparing the normalised author name with the URL parameter.
  const results = Object.fromEntries(
    Object.entries(books).filter(
      ([isbn, detail]) => detail.author.toLowerCase().replaceAll(' ', '-') === author.toLowerCase()
    )
  )
  // Display the matching results for testing.
  console.log(results)
  res.type('json')
  // Return the matching books when results are found.
  if (Object.keys(results).length > 0)
    return res.status(300).send(JSON.stringify(results, null, 2));
  else
    // Return a 404 response when no matching books are found.
    return res.status(404).send({ message: "Book not found." })
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  // Get the title from the URL parameter.
  const title = req.params.title
  // Filter books by comparing the normalised title with the URL parameter.
  const results = Object.fromEntries(
    Object.entries(books).filter(
      ([isbn, detail]) => detail.title.toLowerCase().replaceAll(' ', '-') === title.toLowerCase()
    )
  )
  // Display the matching results for testing.
  console.log(results)
  res.type('json')
  // Return the matching books when results are found.
  if (Object.keys(results).length > 0)
    return res.status(200).send(JSON.stringify(results, null, 2));
  else
    // Return a 404 response when no matching books are found.
    return res.status(404).send({ message: "Book not found." })
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  // Get the ISBN from the URL parameter.
  const isbn = req.params.isbn
  res.type('json')
  // Check whether the requested book exists.
  if (books[isbn])
    // Return the reviews if they exist, otherwise return a message indicating that there are no reviews.
    return res.status(200).send(JSON.stringify(!Object.keys(books[isbn].reviews).length ? { message: "No review have been submitted for this book yet." } : { [isbn]: books[isbn].reviews }, null, 2));
  else
    // Return a 404 response when the book does not exist.
    return res.status(404).send({ message: "Book not found." })
});

// Async GET Books
async function getAllBooks() {
  try {
    // Send an asynchronous GET request to retrieve all books.
    const response = await axios.get('http://localhost:3000')
    // Wait for the request to complete and store the server response.
    console.log(response.data)
    // Display the response data.
  } catch (error) {
    // Handle errors from the Axios request.
    console.log(error.message)
  }
}

// Async GET Books by ISBN
async function getBooksByISBN() {
  try {
    // Send an asynchronous GET request to retrieve the book with ISBN 3.
    const response = await axios.get('http://localhost:3000/isbn/3')
    // Wait for the request to complete and store the server response.
    console.log(response.data)
    // Display the response data.
  } catch (error) {
    // Handle errors from the Axios request.
    console.log(error.message)
  }
}

// Async GET Books by Author
async function getBooksByAuthor() {
  try {
    // Send an asynchronous GET request to retrieve books by Chinua Achebe.
    const response = await axios.get('http://localhost:3000/author/chinua-achebe')
    // Wait for the request to complete and store the server response.
    console.log(response.data)
    // Display the response data.
  } catch (error) {
    // Handle errors from the Axios request.
    console.log(error.message)
  }
}

// Async GET Books by title
async function getBooksByTitle() {
  try {
    // Send an asynchronous GET request to retrieve the book by title.
    const response = await axios.get('http://localhost:3000/title/things-fall-apart')
    // Wait for the request to complete and store the server response.
    console.log(response.data)
    // Display the response data.
  } catch (error) {
    // Handle errors from the Axios request.
    console.log(error.message)
  }
}

// Test in Console
// Execute the asynchronous functions to test the GET endpoints.
getAllBooks()
getBooksByAuthor()
getBooksByISBN()
getBooksByTitle()

module.exports.general = public_users;