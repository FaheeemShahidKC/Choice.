
const dotenv = require('dotenv')
dotenv.config()
// ============================ models ============================
const choiceUser = require("../Models/userModel");
const choiceProduct = require("../Models/productModel");
const choiceAddress = require("../Models/addressModel");
const choiceCategory = require('../Models/categoryModel')
const choiceCoupons = require('../Models/coopenModel')
const choiceBanner = require ('../Models/bannerModel')

//========================== setting as globel variable ==================
let signupUser  
let otp; 

//=========================== email validation ============================
function validateEmail(email) {
      try {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
      } catch (error) {
        console.error("An error occurred:", error);
        return false;
      }
}

//========================== bcrypting password ============================
const bcrypt = require('bcrypt')
async function securePassword(password) {
      let spassword = await bcrypt.hash(password, 10);
      if(spassword){
            return spassword
      }else{
            res.status(500).send("Internal Server Error");
      }
}

//============================== sending mail =================================
const nodemailer = require('nodemailer');
const sendMail = async (name, email, otp) => {
      try {
            const transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  post: 587,
                  secure: false,
                  requireTLS: true,
                  auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASS
                  }
            })

            const mailOption = {
                  from: process.env.EMAIL,
                  to: email,
                  subject: "For OTP verification",
                  html: "<h3>Dear," +
                        name +
                        ", Use this One Time Password </h3> <h1>" +
                        otp +
                        "</h1> to login to your Choice. account. </h3>"
            }

            transporter.sendMail(mailOption, (error, info) => {
                  if (error) {
                        console.log(error)
                  } else {
                        console.log("Email has been sent:", info.response)
                  }
            })
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

//==================================== Home view ===================================
const loadHome  = async(req,res)=>{
      try {
            const page = req.query.page || 1; // Get the requested page from the query string
            const itemsPerPage = 10; // Number of items to display per page
            const totalCount = await choiceProduct.countDocuments(); // Get the total count of products
            const bannersData = await choiceBanner.find()
            const banners = bannersData.filter((banner)=>{
                  return banner.status == true
            })
            if(totalCount){
                  const skip = (page - 1) * itemsPerPage; // Calculate the number of items to skip
                  const products = await choiceProduct
                        .find()
                        .skip(skip)
                        .limit(itemsPerPage);

                  if(products){
                        res.render('home', {banners : banners , products: products, currentPage: parseInt(page), totalPages: Math.ceil(totalCount / itemsPerPage), name: req.session.userName , shop:null });
                  }else{
                        res.status(500).send("Internal Ser Error");
                  }
            }else{
                  res.status(500).send("Internal  Error");
            }
      } catch (error) {
            res.status(500).send("Internal  Error");
            console.log(error.message);
      }
}

//==================================== login page ====================================
const loadLogin = async(req,res)=>{
      try {
            res.render('login',{name: req.session.name})
      } catch (error) {
            res.status(500).send("Internal Server Error" );
      }
}

const loginClickedLoadHome = async (req, res) => {
      const userData = await choiceUser.findOne({ email: req.body.loginEmail });
      
      if (userData) {
            if (await bcrypt.compare(req.body.loginPassword, userData.password)) {
                  if (userData.is_block === false) {
                        req.session.user_id = userData._id;
                        req.session.userName = userData.name;
                        res.redirect('/');
                  } else {
                        res.render('login', { error: "You are blocked by the admin!!", name : req.session.userName });
                  }
            } else {
                  res.render('login', { error: "Invalid password!!" , name : req.session.userName});
            }
      } else {
            res.render('login', { error: "This email is not valid!!" , name : req.session.userName});
      }
};

//==================================== signup page ====================================
const loadSignup = async(req,res)=>{
      try {
            res.render('signup',{name: req.session.name})
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

//==================================== otp page =======================================
const loadOtp = async (req, res) => {
      try {
            choiceUser.findOne({ email: req.body.signupEmail }).then(async (email) => {
                  if (email) {
                        res.render('signup', { error: "Email already exist!!",name : req.session.userName })
                  } else {
                        if (req.body.signupEmail && validateEmail(req.body.signupEmail)) {
                              if (req.body.signupPassword && req.body.signupConfirmPassword && req.body.signupPassword == req.body.signupConfirmPassword) {
                                    bcryptedPassword = await securePassword(req.body.signupPassword)
                                    signupUser = {
                                          name: req.body.signupName,
                                          mobile: req.body.signupMobileNumber,
                                          email: req.body.signupEmail,
                                          password: bcryptedPassword,
                                          is_block: false
                                    }
                                    //generate a random 6-digit OTP
                                    otp = Math.floor(100000 + Math.random() * 900000)
                                    toString(otp)

                                    sendMail(req.body.signupName, req.body.signupEmail, otp)
                                    res.render('otp',{name : req.session.userName})
                              } else {
                                    res.render('signup', { error: "check your password!!" ,name : req.session.userName})
                              }
                        } else {
                              
                              res.render('signup', { error: "Email is not valid!!" ,name : req.session.userName})
                        }
                  }
            })
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

const OtpClickedLoadHome = async (req, res) => {
      try {
            if(req.body.verifyOtp){
                  if (req.body.verifyOtp == otp) {
                        await choiceUser.insertMany([signupUser])
                        req.session.userName = signupUser.name
                        res.redirect('/')
                  } else {
                        res.render('otp', { error: "invalid OTP!!" })
                  }
            }
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

const otpPage = async (req, res) => {
      try {
            res.render('otp',{name : req.session.userName})
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

const resendOtp = async (req, res) => {
      try {
            const randomNumber = Math.floor(Math.random() * 90000) + 10000;
            otp = randomNumber;
            sendMail(signupUser.name, signupUser.email, otp);
            res.redirect("/otpPage");
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
};

// ================================== home product =================================
const productSearch = async (req, res) => {
      try {
            const products = await choiceProduct.find({
                  $or: [
                        { name: { $regex: req.body.search, $options: 'i' } }
                  ]
            });

            if(products){
                  const userName = req.session.userName
                  res.render('shop', { products: products, name: userName});
            }else{
                  res.render('shop',{products:null , name: userName})
            }
            
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
};

const loadProduct = async(req,res)=>{
      try {
            const prodectId  = req.query.id
            const proData = await choiceProduct.findById(prodectId)
            if(proData){
                  res.render('productDetails',{prodectData : proData})
            }else{
                  res.status(500).send("Internal Server Error");
            }
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

// ================================== Logout =================================
const logout = async(req,res)=>{
      try {
            req.session.destroy()
            res.redirect('/')
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

// ==================================== User profile ==========================
const loadProfile = async (req, res) => {
      try {
            let user = req.session.user_id;
            if(user){
                  const Details = await choiceUser.find({ _id : user });
                  const address = await choiceAddress.find({ users: user })
                  const coupons = await choiceCoupons.find({})
                  const wallet = Details[0].wallet
                  const walletHistory = Details[0].walletHistory
                  if(address.length > 0){
                        const addressData = address[0].address
                        if (Details && Details.length > 0) {
                              res.render('profile', { name: req.session.userName,walletHistory : walletHistory, walletAmount : wallet, Details: Details, address: addressData , coupons:coupons});
                        } else {
                              console.log("User not found in the database.");
                              res.status(404).send("User not found");
                        }
                  }else{
                        res.render('profile',{name: req.session.userName, Details: Details, address : null , coupons:coupons})
                  }
            }else{
                  console.log("No user");
            }
      } catch (error) {
            res.status(500).send("Internal Server Error");
            console.log(error.message);
      }
};

const loadAddAddress = async(req,res)=>{
      try {
            res.render('addAddress')
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

//================================== forget password ===================================
const forgetPassSendOtp = async(req,res)=>{
      try {
            const user = req.query.id
            const userdata = await choiceUser.find({_id : user})
            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            otp = randomNumber;
            sendMail(userdata[0].name, userdata[0].email, otp);
            res.render('forgetOtp' , {name : req.session.userName})
      } catch (error) {
            console.log(error.message);
      }
}

const forgetResendOtp = async (req, res) => {
      try {
            res.redirect("/forgetPassword");
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
};

const forgetOtpVerified = async (req, res) => {
      try {
            if(req.body.verifyOtp){
                  if (req.body.verifyOtp == otp) {
                        res.render('changePassword',{name : req.session.userName})
                  } else {
                        res.render('forgetOtp',{name : req.session.userName})
                  }
            }
      } catch (error) { 
            res.status(500).send("Internal Server Error");
      }
}

const passwordChanged = async(req,res)=>{
      try {
            console.log(req.body.newPassword);
            if (req.body.newPassword == req.body.newConfirmPassword){
                  const newPass = await securePassword(req.body.newPassword)
                  await choiceUser.updateOne(
                        {_id : req.session.user_id},
                        {
                              $set: {
                                    password : newPass
                              },
                        }
                  )
                  res.redirect('/profile')
            }else{
                  res.render('changePassword',{name : req.session.userName})
            }
            
      } catch (error) {
            console.log(error.message);
      }
}

//============================== Load shop =================================
const loadShop = async(req,res)=>{
      try {
            const page = req.query.page || 1; // Get the requested page from the query string
            const itemsPerPage = 16; // Number of items to display per page
            const totalCount = await choiceProduct.countDocuments(); // Get the total count of products

            if(totalCount){
                  const skip = (page - 1) * itemsPerPage; // Calculate the number of items to skip
                  const products = await choiceProduct
                        .find()
                        .skip(skip)
                        .limit(itemsPerPage);

                  if(products){
                        const category = await choiceCategory.find({})
                        res.render('shop', {products: products,shop:'shop', currentPage: parseInt(page), totalPages: Math.ceil(totalCount / itemsPerPage), name: req.session.userName ,category : category });
                  }else{
                        res.status(500).send("Internal Ser Error");
                  }
            }else{
                  res.status(500).send("Internal  Error");
            }
      } catch (error) {
            res.status(500).send("Internal  Error");
            console.log(error.message);
      }
}

const filter = async (req, res) => {
      try {
        const cat = req.body.category;
        const price = req.body.price;
        const category = await choiceCategory.find({});
        let filter = {};
    
        if (cat === 'all' && price === 'all') {
          // No specific category or price criteria
          filter = await choiceProduct.find({});
        } else if (cat && price === 'Low to High') {
          // Filter by category and sort by price (Low to High)
          filter = await choiceProduct.find({ category: cat }).sort({ price: 1 });
        } else if (cat && price === 'High to Low') {
          // Filter by category and sort by price (High to Low)
          filter = await choiceProduct.find({ category: cat }).sort({ price: -1 });
        }else if(cat && price == 'all'){
            filter = await choiceProduct.find({ category: cat })
        }
    
        if (filter.length === 0) {
          // Handle the case when no products match the criteria
          res.render('shop', {
            products: null,
            shop: 'shop',
            name: req.session.userName,
            category: category,
            error: 'No products match your search criteria.',
          });
        } else {
          res.render('shop', {
            products: filter,
            shop: 'shop',
            name: req.session.userName,
            category: category,
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    

//=============================== Module exports =====================================
module.exports =  {
      loadHome,
      loadLogin,
      loadSignup,
      loadOtp,
      OtpClickedLoadHome,
      loginClickedLoadHome,
      productSearch,
      loadProduct,
      logout,
      loadProfile,
      otpPage,
      resendOtp,
      loadAddAddress,
      forgetPassSendOtp,
      forgetResendOtp,
      forgetOtpVerified,
      passwordChanged,
      loadShop,
      filter
}