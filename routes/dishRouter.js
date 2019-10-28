const express = require("express");
const bodyParser = require("body-parser");
const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })

  // support for dishes end point
  .get((req, res, next) => {
    res.end("will send all the dishes to you.");
  })
  .post((req, res, next) => {
    res.end(
      "will add the dish " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on dishes");
  })
  .delete((req, res, next) => {
    res.end("Deleting all the dishes");
  });

dishRouter
  .route("/:dishId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })

  // support for dishes end point
  .get((req, res, next) => {
    res.end("will send details of the dish id: " + req.params.dishId);
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on dishes id/" + req.params.dishId);
  })
  .put((req, res, next) => {
    res.write("Updating the dish id" + req.params.dishId + "<p>");
    res.end(
      "will update the dish id: " +
        req.body.name +
        " with details " +
        req.body.description
    );
  })
  .delete((req, res, next) => {
    res.end("Will delete dish id " + req.params.dishId);
  });

module.exports = dishRouter;
