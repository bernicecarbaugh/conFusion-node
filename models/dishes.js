const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema(
  {
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
      type: String,
      required: true
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
    // dish document can have multiple comment documents as subdocuments
    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

var Dishes = mongoose.model("Dish", dishSchema);
module.exports = Dishes;
