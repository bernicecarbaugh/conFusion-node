const express = require("express");
const bodyParser = require("body-parser");
const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  // support for dishes end point
  .get((req, res, next) => {
    res.end("will send all the leaders to you.");
  })
  .post((req, res, next) => {
    res.end(
      "will add the leader " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on leaders");
  })
  .delete((req, res, next) => {
    res.end("Deleting all the leaders");
  });

leaderRouter
  .route("/:leaderId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end("will send details of the leader id: " + req.params.leaderId);
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on leader id/" + req.params.leaderId);
  })
  .put((req, res, next) => {
    res.write("Updating the leader id " + req.params.leaderId + "<p>");
    res.end(
      "will update the leader id: " +
        req.body.name +
        " with details " +
        req.body.description
    );
  })
  .delete((req, res, next) => {
    res.end("Will delete leader id " + req.params.leaderId);
  });

module.exports = leaderRouter;
