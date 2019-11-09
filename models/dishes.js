const mongoose = require("mongoose"); // import mongoose middleware
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

const Schema = mongoose.Schema;

// can you do "const commentSchema = new mongoose.Schema(" ?
const commentSchema = new Schema(
  {
    // JSON object
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      required: false
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" // mongoose model name
    }
  },
  { timestamps: true }
);

const dishSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    image: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    category: {
      type: String,
      default: "entrees"
    },
    label: {
      type: String,
      required: false
    },
    price: {
      type: Currency,
      required: true,
      min: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    // dish document can have multiple comment documents as subdocuments; like 1 : many
    comments: [commentSchema]
  },
  {
    usePushEach: true, // this will push into the array of comments?? not required for mongoose 5 and above (already set to true by default?)
    timestamps: true
  }
);

/*
The first argument is the singular name of the collection your model is for.
** Mongoose automatically looks for the plural, lowercased version of your model name.
Thus, for the example above, the model Dish is for the dishes collection in the database.
*/
var Dishes = mongoose.model("Dish", dishSchema);
module.exports = Dishes;
