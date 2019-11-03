// importing middlewares
var createError = require("http-errors");
var express = require("express");
var path = require("path");
// var cookieParser = require("cookie-parser");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var logger = require("morgan");

// importing routers
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var leaderRouter = require("./routes/leaderRouter");
var promoRouter = require("./routes/promoRouter");

// database
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);

connect.then(
  () => {
    console.log("connected to mongo db server ");
    // console.log("Dishes length: " + Dishes.length);
    // Dishes.find({}).then(dishes => {
    //   console.log("Here are the dishes: " + dishes);
    // });
  },
  err => {
    console.log("couldn't connect to server" + err);
  }
);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// using middleware
app.use(logger("dev"));
app.use(express.json()); // grabs json object from client side
app.use(express.urlencoded({ extended: false })); // grabs the data if it's a string or array

//app.use(cookieParser("12345-67889-09876-54321")); // dummy secret key

// use session instead of cookie for auth
app.use(
  session({
    name: "session-id",
    secret: "12345-67889-09876-54321",
    saveUninitialized: false,
    resave: false,
    store: new FileStore() // stores the session info in the sessions folder
  })
);

// authorize before getting any resources from server
// get info from cookies first; if not avaialble, then ask the user otherwise just try to authenticate
function auth(req, res, next) {
  console.log("Request session: " + JSON.stringify(req.session));

  //  if (!req.signedCookies.user) {
  if (!req.session.user) {
    var authHeader = req.headers.authorization;

    if (!authHeader) {
      var err = new Error("You must provide basic authentication info.");

      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      next(err); // skip everything until error handler;
      return;
    }

    // array containing 2 elements: username and password, extracted from authHeader in base64 encoding
    var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    var username = auth[0];
    console.log("username" + username);
    var password = auth[1];
    console.log("password" + password);

    if (username === "admin" && password === "password") {
      // if authenticated, set up cookies
      // then auth will pass the request to the next middleware
      //res.cookie("user", "admin", { signed: true });
      req.session.user = "admin";
      next();
    } else {
      var err = new Error("Incorrect user name or password.");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      next(err); // skip everything below until error handler;
      return;
    }
  } else {
    // cookie exists
    // if (req.signedCookies.user === "admin") {
    if (req.session.user === "admin") {
      next();
    } else {
      var err = new Error("You are not authenticated.");
      err.status = 401;
      next(err);
      return;
    }
  }
}

app.use(auth);

// serve static data from server
app.use(express.static(path.join(__dirname, "public"))); // routes the static pages (index, about, etc)

// URLS
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishRouter); // when http request calls the dishes url endpoint, use dishRouter which was declared / imported earlier
app.use("/leaders", leaderRouter);
app.use("/promotions", promoRouter);
app.use("/promos", promoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
