const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema({
  users: {
    type: mongoose.Types.ObjectId,
    ref: "choiceUser",
    required:true
  },
  address: [
    {
      fullname: {
        type: String,
        required: true
      },
      mobile: {
        type: Number,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      houseName: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },

      pin: {
        type: String,
        required: true
      },
    },
  ],
});

module.exports = mongoose.model("choiceAddress", userAddressSchema);