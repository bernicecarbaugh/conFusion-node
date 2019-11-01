const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Dishes = require("../models/dishes");

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route("/")
  // support for dishes end point
  .get((req, res, next) => {
    //res.end("will send all the dishes to you.");
    Dishes.find({})
      .then(
        dishes => {
          console.log("Sending all dishes to you");
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    // res.end(
    //   "will add the dish " +
    //     req.body.name +
    //     " with details: " +
    //     req.body.description
    // );
    Dishes.create(req.body)
      .then(
        dish => {
          console.log("dish created", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on dishes");
  })
  .delete((req, res, next) => {
    // res.end("Deleting all the dishes");
    Dishes.remove({})
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

dishRouter
  .route("/:dishId")
  // support for dishes end point
  .get((req, res, next) => {
    //res.end("will send details of the dish id: " + req.params.dishId);
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on dishes id/" + req.params.dishId);
  })
  .put((req, res, next) => {
    //res.write("Updating the dish id" + req.params.dishId + "<p>");
    // res.end(
    //   "will update the dish id: " +
    //     req.body.name +
    //     " with details " +
    //     req.body.description
    // );
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    //res.end("Will delete dish id " + req.params.dishId);
    Dishes.findByIdAndRemove(req.params.dishId)
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = dishRouter;
