var express = require("express");
const bodyParser = require("body-parser");

var User = require("../models/users");
var userRouter = express.Router();
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.get("/", (req, res, next) => {
  res.send("respond with a resource");
});

userRouter.post("/signup", (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then(user => {
      if (user != null) {
        var err = new Error("User " + req.body.username + " already exists");
        err.status = 403;
        next(err);
      } else {
        return User.create({
          username: req.body.username,
          password: req.body.password
        });
      }
    })
    .then(
      user => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ status: "Registration successful", user: user });
      },
      err => next(err)
    )
    .catch(err => next(err));
});

userRouter.post("/login", (req, res, next) => {
  console.log("req.session.user" + JSON.stringify(req.session.user));

  if (!req.session.user) {
    console.log("no req.session.user");
    var authHeader = req.headers.authorization;

    if (!authHeader) {
      var err = new Error("You must provide basic authentication info.");

      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      next(err);
      return;
    }

    var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    var username = auth[0];
    console.log("username" + username);
    var password = auth[1];
    console.log("password" + password);

    User.findOne({ username: username })
      .then(user => {
        if (user === null) {
          var err = new Error("User " + username + " does not exist.");
          err.status = 403;
          next(err);
          return;
        } else if (user.password !== password) {
          var err = new Error("Wrong password.");
          err.status = 403;
          next(err);
          return;
        } else if (user.username === username && user.password === password) {
          req.session.user = "authenticated";
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("You are authenticated.");
        }
      })
      .catch(err => next(err));
  }

  // already authenticated - req.session.user is true
  else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You are already authenticated.");
  }
});

userRouter.get("/logout", (req, res, next) => {
  if (req.session) {
    // session must exist so you can log out of it
    req.session.destroy(); // removes session from server side
    res.clearCookie("session-id"); // removes cookie from client side
    res.redirect("/"); // redirect to standard home page
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

module.exports = userRouter;
