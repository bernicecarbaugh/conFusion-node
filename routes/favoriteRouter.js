const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const cors = require("./corsRouter");

const Favorites = require("../models/favorites");
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(
    cors.cors,
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      Favorites.find()
        .populate("comments.author")
        .populate("users.username")
        .then(
          favorites => {
            console.log("Sending all favorites to you");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorites);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(favorite => {
      if (favorite != null) {
        // for loop
        favorite.userFavorites.push(req.body);

        favorite.save().then(
          favorite => {
            console.log("favorite document created", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          },
          err => next(err)
        );
      } else {
        Favorites.create({
          user: req.user._id,
          userFavorites: req.body
        })
          .then(
            favorite => {
              console.log("favorite created", favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            },
            err => next(err)
          )
          .catch(err => next(err));
      }
    });
  });

// support for favorties/dishid end points
favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (favorite != null) {
            console.log("adding to favorite dish: ", req.params.dishId);
            favorite.userFavorites.push(req.params.dishId);
            favorite.save();
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite.userFavorites);
          } else {
            Favorites.create({
              user: req.user._id,
              userFavorites: req.params.dishId
            });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite.userFavorites);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (
            favorite != null &&
            favorite.userFavorites.id(req.params.dishId) != null
          ) {
            favorite.userFavorites.id(req.params.dishId).remove();
            favorite.save().then(
              favorite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              },
              err => next(err)
            );
          } else if (favorite == null) {
            err = new Error("Dish " + req.params.dishId + " not found.");
            err.statusCode = 404;
            return next(err);
          } else {
            // favorite is null
            err = new Error(
              "Favorite for user " + req.user._id + " not found."
            );
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = favoriteRouter;
