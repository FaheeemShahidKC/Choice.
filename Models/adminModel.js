const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
      email : {
            type : String,
            require : true
      },
      password : {
            type : String,
            require : true
      }
})

const choiceAdmin = mongoose.model('choiceAdmin',adminSchema)

module.exports = choiceAdmin