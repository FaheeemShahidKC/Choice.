const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
      categoryName:{
            type:String,
            required:true
      },
      is_block:{
            type:Boolean,
            default:false
      }
})

const choiceCategory  = mongoose.model('choiceCategory',categorySchema)
module.exports = choiceCategory