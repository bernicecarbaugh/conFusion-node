const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const multer = require("multer");
const cors = require("./corsRouter");

// CONFIGURE MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // cb function parameters: error, destination folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // filename for the file uploaded
  }
});

// you can specify what files user can upload
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("You can upload only image files", false));
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });
//const upload = multer({ dest: "../uploads/" });

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /imageUpload");
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    upload.single("imageFile"), // this needs to be the key that is in the request body
    (req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(req.file);
    }
  )
  // .post(upload.single("imageFile"), (req, res) => {
  //   authenticate.verifyUser, authenticate.verifyAdmin, (res.statusCode = 200);
  //   res.setHeader("Content-Type", "application/json");
  //   res.json(req.file);
  // })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /imageUpload");
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end("DELETE operation not supported on /imageUpload");
  });

module.exports = uploadRouter;
