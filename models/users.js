var mongoose = require("mongoose");
// this connects the passport methods to the User object
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  // will be added by local passport mongoose
  // username: {
  //   type: String,
  //   required: true,
  //   unique: true
  // },
  // password: {
  //   type: String,
  //   required: true
  // },
  firstname: {
    type: String,
    default: ""
  },
  lastname: {
    type: String,
    default: ""
  },
  admin: {
    type: Boolean,
    default: false
  }
});

// very important passportLocalMongoose
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
