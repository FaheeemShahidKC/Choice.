const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
      name : {
            type:String,
            required:true
      },
      category: {
            type: String,
            required: true
      },
      images:{
            image1:{
                  type: String,
                  required:true
            },
            image2:{
                  type: String,
                  required:true
            },
            image3:{
                  type: String,
                  required:true
            },
            image4:{
                  type: String,
                  required:true
            }
      },
      quantity: {
            type: Number,
            required: true
      },
      blocked: {
            type: Number,
            default:0
      },
      price: {
            type: Number,
            default: 0
      },
      description:{
            type:String,
            required: true
      }
})


const choiceProduct = mongoose.model("choiceProduct",productSchema)

module.exports = choiceProduct