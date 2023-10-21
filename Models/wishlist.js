const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: {
        type: ObjectId,
        ref: "choiceProduct",
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("choiceWishlist", wishlistSchema);