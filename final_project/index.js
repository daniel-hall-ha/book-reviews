require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON"
        });
    }

    next(err);
});

app.use("/customer",
    session({
        secret: process.env.SESSION_SECRET, 
        resave: true, 
        saveUninitialized: false, 
        cookie: {
            maxAge: 60000,
            httpOnly: true,
            sameSite: 'lax'
        }
    }))

app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.accessToken) {
        jwt.verify(req.session.accessToken, process.env.SESSION_SECRET, (err, decoded) => {
            if (err) {
                console.log('AUTH FAILED ', new Date().toISOString(), ' ', JSON.stringify(jwt.decode(req.session.accessToken)).replace(/\s+/g, ' '))
                return res.status(400).json({ message: err })
            }
            else {
                console.log('AUTH SUCCESS ', new Date().toISOString(), ' ', JSON.stringify(decoded).replace(/\s+/g, ' '))
                return next()
            }
        })
    }
    else
        return res.status(400).json({ message: "Unauthorized" })
});

const PORT = 3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
