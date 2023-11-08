
const dotenv = require('dotenv')
dotenv.config()
// ============================ models ============================
const choiceUser = require("../Models/userModel");
const choiceProduct = require("../Models/productModel");
const choiceAddress = require("../Models/addressModel");
const choiceCategory = require('../Models/categoryModel')
const choiceCoupons = require('../Models/coopenModel')
const choiceBanner = require('../Models/bannerModel')
const choiceReview = require('../Models/reviewModel')

//========================== setting as globel variable ==================
let signupUser
let otp;

//============================= name validation =========================
function validateName(name) {
      // Check if the input is empty
      if (name.trim() === '') {
            return false;
      }

      // Use a regular expression to match only letters and spaces
      const regex = /^[A-Za-z\s]+$/;
      return regex.test(name);
}

//=========================== email validation ============================
function validateEmail(email) {
      try {
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            return emailRegex.test(email);
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//================================ name validation ================================
function validateMobileNumber(mobileNumber) {
      const cleanNumber = mobileNumber.replace(/\D/g, '');

      if (cleanNumber.length === 10 && cleanNumber[0] !== '0') {
            return true;
      } else {
            return false;
      }
}

//========================== bcrypting password ============================
const bcrypt = require('bcrypt')
async function securePassword(password) {
      let spassword = await bcrypt.hash(password, 10);
      if (spassword) {
            return spassword
      } else {
            console.log("bcrypt");
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
            console.log(error.message);
            res.render('404')
      }
}

//==================================== Home view ===================================
const loadHome = async (req, res) => {
      try {
            const bannersData = await choiceBanner.find();
            const banners = bannersData.filter((banner) => {
                  return banner.status == true;
            });

            const products = await choiceProduct
                  .find()
                  .sort({ createdAt: -1 }) // Assuming there's a "createdAt" field in your product schema
                  .limit(5);

            if (products) {
                  res.render('home', { banners: banners, products: products, name: req.session.userName });
            } else {
                  res.status(500).send("Internal Server Error");
            }
      } catch (error) {
            console.log(error.message);
            res.render('404');
      }
}


//==================================== login page ====================================
const loadLogin = async (req, res) => {
      try {
            res.render('login', { name: req.session.name })
      } catch (error) {
            res.status(500).send("Internal Server Error");
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
                        res.render('login', { error: "You are blocked by the admin!!", name: req.session.userName });
                  }
            } else {
                  res.render('login', { error: "Invalid password!!", name: req.session.userName });
            }
      } else {
            res.render('login', { error: "This email is not valid!!", name: req.session.userName });
      }
};

//==================================== signup page ====================================
const loadSignup = async (req, res) => {
      try {
            res.render('signup', { name: req.session.name })
      } catch (error) {
            res.status(500).send("Internal Server Error");
      }
}

//==================================== otp page =======================================
const loadOtp = async (req, res) => {
      try {
            if (req.body.signupEmail && req.body.signupName && req.body.signupMobileNumber && req.body.signupPassword && req.body.signupConfirmPassword) {
                  choiceUser.findOne({ email: req.body.signupEmail }).then(async (email) => {
                        if (email) {
                              res.render('signup', { error: "Email already exist!!", name: req.session.userName })
                        } else {
                              if (req.body.signupEmail && validateEmail(req.body.signupEmail)) {
                                    if (req.body.signupPassword && req.body.signupConfirmPassword && req.body.signupPassword == req.body.signupConfirmPassword) {
                                          bcryptedPassword = await securePassword(req.body.signupPassword)
                                          if (validateMobileNumber(req.body.signupMobileNumber)) {
                                                if (validateName(req.body.signupName)) {
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
                                                      res.render('otp', { name: req.session.userName })
                                                } else {
                                                      res.render('signup', { error: "Enter the valid name!!", name: req.session.userName })
                                                }
                                          } else {
                                                res.render('signup', { error: "Enter valid mobile number!!", name: req.session.userName })
                                          }
                                    } else {
                                          res.render('signup', { error: "check your password!!", name: req.session.userName })
                                    }
                              } else {
                                    res.render('signup', { error: "Email is not valid!!", name: req.session.userName })
                              }
                        }
                  })
            } else {
                  res.render('signup', { error: "Please enter the full data!!", name: req.session.userName })
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const OtpClickedLoadHome = async (req, res) => {
      try {
            if (req.body.verifyOtp) {
                  if (req.body.verifyOtp == otp) {
                        await choiceUser.insertMany([signupUser])
                        req.session.userName = signupUser.name
                        // req.session.user_id = signupUser
                        res.redirect('/login')
                  } else {
                        res.render('otp', { error: "invalid OTP!!" })
                  }
            } else {
                  res.render('otp', { error: "invalid OTP!!" })
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const otpPage = async (req, res) => {
      try {
            res.render('otp', { name: req.session.userName })
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const resendOtp = async (req, res) => {
      try {
            const randomNumber = Math.floor(Math.random() * 90000) + 10000;
            otp = randomNumber;
            sendMail(signupUser.name, signupUser.email, otp);
            res.redirect("/otpPage");
      } catch (error) {
            console.log(error.message);
            res.render('404')
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
            const userName = req.session.userName
            if (products.length > 0) {
                  res.render('shop', { products: products, name: userName, search: "dd", shop: 'a' });
            } else {
                  res.render('shop', { name: userName, products: null, shop: 'a', search: "dd", error: "No products related to your search" })
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

const loadProduct = async (req, res) => {
      try {
            const prodectId = req.query.id
            const proData = await choiceProduct.findById(prodectId)
            const reviewData = await choiceReview.findOne({ productId: prodectId }).populate('review.user').populate('review.replay.user')
            const reviews = reviewData ? reviewData.review : []

            //average rating
            const ratings = reviews.map((review) => review.rating);
            const sumOfRatings = ratings.reduce((total, rating) => total + rating, 0);
            const averageRating = sumOfRatings / ratings.length;

            if (proData) {
                  res.render('productDetails', { prodectData: proData, reviews: reviews, averageRating: averageRating })
            } else {
                  res.status(500).send("Internal Server Error");
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

// ================================== Logout =================================
const logout = async (req, res) => {
      try {
            req.session.destroy()
            res.redirect('/')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

// ==================================== User profile ==========================
const loadProfile = async (req, res) => {
      try {
            let user = req.session.user_id;
            if (user) {
                  const Details = await choiceUser.find({ _id: user })
                  const address = await choiceAddress.find({ users: user })
                  const coupons = await choiceCoupons.find({})
                  const wallet = Details[0].wallet
                  const walletHistory = Details[0].walletHistory.sort((a, b) => b.date - a.date);
                  if (address.length > 0) {
                        const addressData = address[0].address
                        if (Details && Details.length > 0) {
                              res.render('profile', { name: req.session.userName, walletHistory: walletHistory, walletAmount: wallet, Details: Details, address: addressData, coupons: coupons });
                        } else {
                              console.log("User not found in the database.");
                              res.status(404).send("User not found");
                        }
                  } else {
                        res.render('profile', { name: req.session.userName, Details: Details, address: null, coupons: coupons })
                  }
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

const loadAddAddress = async (req, res) => {
      try {
            res.render('addAddress')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//================================== forget password ===================================
const enterEmail = async (req, res) => {
      try {
            res.render("forgetEmail")
      } catch (error) {
            console.log(error.message);
      }
}

const enteredEmail = async (req, res) => {
      try {
            if (validateEmail(req.body.forgetEmail)) {
                  choiceUser.findOne({ email: req.body.forgetEmail }).then(async (email) => {
                        if (email) {
                              const userdata = await choiceUser.findOne({ email: req.body.forgetEmail })
                              const randomNumber = Math.floor(Math.random() * 9000) + 1000;
                              otp = randomNumber;
                              sendMail(userdata.name, userdata.email, otp);
                              req.session.forgetEmail = userdata.email
                              res.render('forgetOtp', { name: req.session.userName })
                        } else {
                              res.render("forgetEmail", { error: "This email doesn't exist!" })
                        }
                  })
            } else {
                  res.render("forgetEmail", { error: "Enter a valid email!" })
            }

      } catch (error) {
            console.log(error.message);
      }
}

const forgetPassSendOtp = async (req, res) => {
      try {
            const user = req.session.user_id
            const userdata = await choiceUser.find({ _id: user })
            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            otp = randomNumber;
            sendMail(userdata[0].name, userdata[0].email, otp);
            res.render('forgetOtp', { name: req.session.userName })
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const forgetResendOtp = async (req, res) => {
      try {
            res.redirect("/forgetPassword");
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

const forgetOtpVerified = async (req, res) => {
      try {
            if (req.body.verifyOtp) {
                  if (req.body.verifyOtp == otp) {
                        res.render('changePassword', { name: req.session.userName })
                  } else {
                        res.render('forgetOtp', { name: req.session.userName, error: "OTP is incorrect!" })
                  }
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const passwordChanged = async (req, res) => {
      try {
            if ((req.body.newPassword.trim() != "" || req.body.newConfirmPassword != "") && (req.body.newConfirmPassword == req.body.newPassword)) {
                  const newPass = await securePassword(req.body.newPassword)
                  if (req.session.user_id) {
                        await choiceUser.updateOne(
                              { _id: req.session.user_id },
                              {
                                    $set: {
                                          password: newPass
                                    },
                              }
                        )
                  } else if (req.session.forgetEmail) {
                        await choiceUser.updateOne(
                              { email: req.session.forgetEmail },
                              {
                                    $set: {
                                          password: newPass
                                    },
                              }
                        )
                  }
                  res.redirect('/profile')
            } else {
                  res.render('changePassword', { name: req.session.userName, error: "Check the password!" })
            }

      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//============================== Load shop =================================
const loadShop = async (req, res) => {
      try {
            const page = req.query.page || 1; // Get the requested page from the query string
            const itemsPerPage = 6; // Number of items to display per page
            let totalCount = await choiceProduct.countDocuments(); // Get the total count of products

            const skip = (page - 1) * itemsPerPage; // Calculate the number of items to skip
            const products = await choiceProduct
                  .find()
                  .skip(skip)
                  .limit(itemsPerPage);

            if (products.length > 0) {
                  const category = await choiceCategory.find({})
                  res.render('shop', { products: products, shop: 'shop', currentPage: parseInt(page), totalPages: Math.ceil(totalCount / itemsPerPage), name: req.session.userName, category: category });
            } else {
                  res.render('shop', { name: req.session.userName, error: '"Welcome to Choice. shop" There is some stock managment going on."' })
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
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
            } else if (cat && price == 'all') {
                  filter = await choiceProduct.find({ category: cat })
            }

            if (filter.length === 0) {
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
            res.render('404')
      }
}


//=============================== Module exports =====================================
module.exports = {
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
      filter,
      enterEmail,
      enteredEmail
}