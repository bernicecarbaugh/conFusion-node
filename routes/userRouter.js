var express = require("express");
const bodyParser = require("body-parser");

var User = require("../models/users");
var passport = require("passport");
var authenticate = require("../authenticate");

var userRouter = express.Router();
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.get("/", (req, res, next) => {
  res.send("respond with a resource");
});

userRouter.post("/signup", (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: true,
            status: "Registration successful"
          });
        });
      }
    }
  );
});

userRouter.post(
  "/login",
  // works like proomises; if authenticate is successul goes to next middleware
  passport.authenticate("local"),
  (req, res, next) => {
    // can encode other user data but can look up in mongo with userid
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token: token, // pass token back
      status: "You are authenticated and logged in"
    });
  }
);

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
