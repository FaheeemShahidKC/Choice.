const mongoose = require('mongoose')

let dotenv = require('dotenv')
dotenv.config()

module.exports={

   mongoDB:()=>{
      mongoose.connect(process.env.mongooo,{
      
      }).then(()=>{
      console.log("Database connected");
      }).catch((err)=>{
      console.log(err);
      })
   }

}