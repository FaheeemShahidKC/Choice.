const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
      name: {
            type: String,
            require: true
      },
      email: {
            type: String,
            require: true
      },
      mobile: {
            type: Number,
            require: true
      },
      password: {
            type: String,
            require: true
      },
      is_block: {
            type: Boolean,
            default: false
      }, wallet: {
            type: Number,
            default: 0
      },
      walletHistory: [{
            date: {
                  type: Date
            },
            amount: {
                  type: Number,
            },
            reason: {
                  type: String,
            }
      }]
})

const choiceUser = mongoose.model('choiceUser', userSchema)

module.exports = choiceUser