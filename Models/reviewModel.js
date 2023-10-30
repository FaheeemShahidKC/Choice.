const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
      productId: {
            type: String,
            required: true,
            ref: 'choiceProduct'
      },

      review: [
            {
                  user: {
                        type: String,
                        ref: "choiceUser",
                  },
                  rating: {
                        type: Number,
                        required: true
                  },
                  comment: {
                        type: String,
                        required: true,
                  },
                  likes: {
                        type: Array,
                        required: true,
                  },
                  replay: [
                        {
                              user: {
                                    type: String,
                                    ref: "choiceUser"
                              },
                              comment: {
                                    type: String,
                                    required: true,
                              }
                        }
                  ]
            },
      ],

});

module.exports = mongoose.model("choiceReview", reviewSchema);