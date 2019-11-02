const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;
// "name": "Weekend Grand Buffet",
// "image": "images/buffet.png",
// "label": "New",
// "price": "19.99",
// "description": "Featuring . . .",
// "featured": false
const promotionSchema = new Schema(
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
    }
  },
  {
    timestamps: true
  }
);

var Promotions = mongoose.model("Promotion", promotionSchema);
module.exports = Promotions;
