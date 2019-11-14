var express = require("express");
const bodyParser = require("body-parser");

var User = require("../models/users");
var passport = require("passport"); // passport contains many strategies; in this case, we are using passport local mongoose strategy
var authenticate = require("../authenticate");
var cors = require("./corsRouter");

var userRouter = express.Router();
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser, // have to call this first to get the req.user object which verify admin needs
  authenticate.verifyAdmin,
  (req, res, next) => {
    User.find({})
      .then(
        users => {
          console.log("Sending all users");
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(users);
        },
        err => next(err)
      )
      .catch(err => next(err));
  }
);

/* POST users/signup. */
userRouter.post("/signup", cors.corsWithOptions, (req, res, next) => {
  // register is a passport method to create a new user
  User.register(
    // 3 parameters - username, password and error handling callback function
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        // success we got a user back from passport

        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }

        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }

        // save is a mongoose method - saves the user to the db
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          // first you authenticate ("local" refers to passport local mongoose strategy/module/package)
          // passport requires a separate authenticate method to ensure user was successful
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: true,
              status: "Registration successful"
            });
          });
        });
      }
    }
  );
});

userRouter.post(
  "/login",
  cors.corsWithOptions,
  // works like promises; if authenticate is successul goes to next middleware
  // authenticate method lets you authenticate using a username and password
  passport.authenticate("local"),
  (req, res, next) => {
    // can encode other user data but can look up in mongo with userid
    // getToken method of our own authenticate module
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

userRouter.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  (req, res) => {
    if (req.user) {
      var token = authenticate.getToken({ _id: req.user._id });
      // once you authenticate with facebook you can discard it because from here out we just rely on jwt
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token: token, // pass token back
        status: "You are authenticated and logged in"
      });
    }
  }
);

userRouter.get("/logout", (req, res, next) => {
  console.log(req);
  console.log(req.session);
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
