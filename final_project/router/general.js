const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const crypto = require('node:crypto');
const axios = require('axios')
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  if (Object.keys(req.body).length !== 2 || Object.keys(req.body)[0] !== "username" || Object.keys(req.body)[1] !== "password")
    return res.status(400).json({ message: "Invalid Payload" });
  if (!req.body.username)
    return res.status(400).json({ message: "Username required" });
  if (!req.body.password)
    return res.status(400).json({ message: "Password required" });
  if (users.find(user => user.username === req.body.username))
    return res.status(400).json({ message: "User already exists" });
  users.push({
    "uid": users.length + 1,
    "username": req.body.username,
    "password": crypto.createHmac('sha256', process.env.SECRET_KEY).update(req.body.password).digest('hex')
  })
  return res.status(200).json({ message: "User registered successfully " })
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const result = Object.entries(books).map(([isbn, detail]) => {
    return {
      isbn: isbn,
      title: detail.title,
      author: detail.author
    };
  }); 
  res.type('json');
  return res.status(200).send(JSON.stringify(result, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn
  res.type('json')
  if (books[isbn])
    return res.status(200).send(JSON.stringify({ [isbn]: books[isbn] }, null, 2));
  else
    return res.status(404).send({ messsage: "No resource found." })
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author
  const results = Object.fromEntries(
    Object.entries(books).filter(
      ([isbn, detail]) => detail.author.toLowerCase().replaceAll(' ', '-') === author.toLowerCase()
    )
  )
  console.log(results)
  res.type('json')
  if (Object.keys(results).length > 0)
    return res.status(300).send(JSON.stringify(results, null, 2));
  else
    return res.status(404).send({ message: "No resource found." })
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title
  const results = Object.fromEntries(
    Object.entries(books).filter(
      ([isbn, detail]) => detail.title.toLowerCase().replaceAll(' ', '-') === title.toLowerCase()
    )
  )
  console.log(results)
  res.type('json')
  if (Object.keys(results).length > 0)
    return res.status(200).send(JSON.stringify(results, null, 2));
  else
    return res.status(404).send({ message: "No resource found." })
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn
  res.type('json')
  if (books[isbn])
    return res.status(200).send(JSON.stringify({ [isbn]: books[isbn].reviews }, null, 2));
  else
    return res.status(404).send({ message: "No resource found." })
});

// Async GET Books
async function getAllBooks() {
  try {
    const response = await axios.get('http://localhost:3000')
    console.log(response.data)
  } catch (error) {
    console.log(error.message)
  }
}

// Async GET Books by ISBN
async function getBooksByISBN() {
  try {
    const response = await axios.get('http://localhost:3000/isbn/3')
    console.log(response.data)
  } catch (error) {
    console.log(error.message)
  }
}

// Async GET Books by Author
async function getBooksByAuthor() {
  try {
    const response = await axios.get('http://localhost:3000/author/chinua-achebe')
    console.log(response.data)
  } catch (error) {
    console.log(error.message)
  }
}


// Async GET Books by title
async function getBooksByTitle() {
  try {
    const response = await axios.get('http://localhost:3000/title/things-fall-apart')
    console.log(response.data)
  } catch (error) {
    console.log(error.message)
  }
}

// Test in Console
getAllBooks()
getBooksByAuthor()
getBooksByISBN()
getBooksByTitle()

module.exports.general = public_users;
