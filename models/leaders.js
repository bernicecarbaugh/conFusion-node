const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// "name": "Peter Pan",
// "image": "images/alberto.png",
// "designation": "Chief Epicurious Officer",
// "abbr": "CEO",
// "description": "Our CEO, Peter, . . .",
// "featured": false
const leaderSchema = new Schema(
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
    designation: {
      type: String,
      required: true
    },
    abbr: {
      type: String,
      required: false
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

var Leaders = mongoose.model("Leader", leaderSchema);
module.exports = Leaders;
