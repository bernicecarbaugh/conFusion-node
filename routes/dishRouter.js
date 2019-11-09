const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");

const Dishes = require("../models/dishes");
const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

// support for dishes end point
dishRouter
  .route("/")
  // open - no auth
  .get((req, res, next) => {
    //res.end("will send all the dishes to you.");
    Dishes.find({})
      .populate("comments.author")
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
  // for post request - apply auth middleware
  // if successful move on to next function;
  // else error returned and handled by passport error
  .post(authenticate.verifyUser, (req, res, next) => {
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
  .delete(authenticate.verifyUser, (req, res, next) => {
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

// support for dishes/dishid end points
dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    //res.end("will send details of the dish id: " + req.params.dishId);
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
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
  .put(authenticate.verifyUser, (req, res, next) => {
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
  .delete(authenticate.verifyUser, (req, res, next) => {
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

// support for dishes/dishId/comments end point
dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        dish => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            err = new Error("Dish " + req.params.dishId + " not found.");
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null) {
            // JWT puts the user id in body req.user
            // mongoose change - to get first and last name from user id
            // we are not sending it from client but populated from server
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish
              .save()
              // the instructions do not match the video for this part. video more complicated!
              .then(
                dish => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(dish);
                },
                err => next(err)
              );
          } else {
            err = new Error("Dish " + req.params.dishId + " not found.");
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on dishes" + req.params.dishId + "/comments"
    );
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null) {
            // no easy way to delete all comments in an array
            // have to remove each subdocument one by one
            for (let i = dish.comments.length - 1; i >= 0; i--) {
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then(
              dish => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              err => next(err)
            );
          } else {
            err = new Error("Dish " + req.params.dishId + " not found.");
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

// support for dishes/dishId/comments/:commentId end point
dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("Comments.author")
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found.");
            err.statusCode = 404;
            return next(err);
          } else {
            // dish exists but comment does not
            err = new Error("Comment " + req.params.commentId + " not found");
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            // only allow rating and comment to be updated, not author
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save().then(
              dish => {
                // instructions do not match video again for this part
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then(dish => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
              },
              err => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found.");
            err.statusCode = 404;
            return next(err);
          } else {
            // dish exists but comment does not
            err = new Error("Comment " + req.params.commentId + " not found");
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              dish => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              err => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + " not found.");
            err.statusCode = 404;
            return next(err);
          } else {
            // comment is null
            err = new Error("Comment " + req.params.commentId + " not found.");
            err.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = dishRouter;
