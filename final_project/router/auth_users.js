const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const crypto = require("node:crypto");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const find = users.find(user => user.username === username)
  const hmac_password = crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex')
  if (find && find.password === hmac_password)
    return true
  else
    return false
}

//only registered users can login
regd_users.post("/login", (req,res) => {

  if (Object.keys(req.body).length !== 2 || Object.keys(req.body)[0] !== "username" || Object.keys(req.body)[1] !== "password")
    return res.status(400).json({ message: "Invalid Payload" });
  if (!req.body.username)
    return res.status(400).json({ message: "Username required" });
  if (!req.body.password)
    return res.status(400).json({ message: "Password required" });

  const username = req.body.username
  const password = req.body.password
  if (authenticatedUser(req.body.username, req.body.password)) {
    req.session.accessToken = jwt.sign({ username: username }, process.env.SESSION_SECRET, { expiresIn: 60000 })
    return res.status(200).json({ message: "Login Successfully" })
  } else {
    return res.status(400).json({ message: "Invalid credentials" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
  if (Object.keys(req.body).length !== 2 || Object.keys(req.body)[0] !== "rating" || Object.keys(req.body)[1] !== "description")
    return res.status(400).json({ message: "Invalid Payload" });

  if (isNaN(req.body.rating))
    return res.status(400).json({ message: "Invalid Rating (must be 0~5)" });

  const isbn = req.params.isbn
  if (!books[isbn])
    return res.status(404).json({ message: "Resource not found." });

  const username = jwt.decode(req.session.accessToken).username
  books[isbn]['reviews'][username] = ({ 'rating': req.body.rating, 'description': req.body.description })

  res.type('json')
  return res.status(200).send({ status: 'Success', review: books[isbn]['reviews'] })
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

  const username = jwt.decode(req.session.accessToken).username
  const isbn = req.params.isbn

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username]
    return res.status(200).json({ status: 'Success' })
  } else {
    return res.status(400).json({ status: 'Review not found!' })
  }

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
