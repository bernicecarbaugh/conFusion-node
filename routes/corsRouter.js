const express = require("express");
const cors = require("cors");

const whitelist = ["http://localhost:3000", "https://localhost:3443"];
var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  console.log(req.header("Origin"));
  if (whitelist.indexOf(req.header("Origin")) != -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors();
// if you need to call cors with specific options
exports.corsWithOptions = cors(corsOptionsDelegate);
