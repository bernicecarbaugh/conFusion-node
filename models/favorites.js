const mongoose = require("mongoose"); // import mongoose middleware

const Schema = mongoose.Schema;

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    // user can have multiple dish favorites
    userFavorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish"
      }
    ]
  },
  {
    usePushEach: true,
    timestamps: true
  }
);

var Favorites = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorites;
