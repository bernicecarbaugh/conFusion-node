// importing middlewares
var createError = require("http-errors");
var express = require("express");
var path = require("path");
// var cookieParser = require("cookie-parser");
var logger = require("morgan");
// var session = require("express-session");
// var FileStore = require("session-file-store")(session);

// passport is token based auth
var passport = require("passport");
// var authenticate = require("./authenticate");
var config = require("./config");

// importing routers
var indexRouter = require("./routes/indexRouter");
var userRouter = require("./routes/userRouter");
var dishRouter = require("./routes/dishRouter");
var leaderRouter = require("./routes/leaderRouter");
var promoRouter = require("./routes/promoRouter");

// database
const mongoose = require("mongoose");
const url = config.mongoUrl;
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
// use jwt instead of session
// app.use(
//   session({
//     name: "session-id",
//     secret: "12345-67889-09876-54321",
//     saveUninitialized: false,
//     resave: false,
//     store: new FileStore() // stores the session info in the sessions folder
//   })
// );

console.log("passport initalize");
// just says we're going to passport middleware so we don't have to parse or build our own username/password schema
// passport can validate username / password if in database, or if not, then it can create
app.use(passport.initialize());

// session is not encoded so not good practice to use
// app.use(passport.session());

console.log("Routing");
app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/user", userRouter);

// authorize before getting any resources from server
// we used to call auth every time we want to pass a request but now using tokens
// function auth(req, res, next) {
//   if (!req.user) {
//     var err = new Error("You are not authenticated.");
//     err.status = 401;
//     return next(err);
//   } else {
//     if (req.session.user === "authenticated") {
//       next();
//     } else {
//       next();
//     }
//   }
// }

// app.use(auth);

// serve static data from server
// anyone can access the public files without auth
app.use(express.static(path.join(__dirname, "public"))); // routes the static pages (index, about, etc)

// URLS
// when http request calls the dishes url endpoint, use dishRouter which was declared / imported earlier
app.use("/dishes", dishRouter);
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
