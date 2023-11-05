//===================== server setup =======================
const express = require('express')
const userRoutes = express()

//===================== authentication =========================
const auth = require('../MiddleWares/userAuth')

//===================== setting session =========================
const session = require('express-session')
userRoutes.use(session({
  secret: 'ok',
  resave: false,
  saveUninitialized: false
}));

// ==================== controllers setup ===========================
const userController = require('../Controllers/userController');
const addressController = require('../Controllers/addressController');
const cartController = require('../Controllers/cartController')
const orderController = require('../Controllers/orderController')
const couponController = require('../Controllers/couponController')
const wishlistController = require('../Controllers/wishlistController')
const reviewController = require('../Controllers/reviewController')

//========================= parsing setup ========================
userRoutes.use(express.json())
userRoutes.use(express.urlencoded({extended:true}))

// ======================= view engine setup =======================
userRoutes.set('view engine','ejs')
userRoutes.set('views','./views/userView')

//=============================== Route setup =====================
// ================================== Home ========================
userRoutes.get('/',userController.loadHome)
userRoutes.get('/home',auth.isLogin,userController.loadHome)

//============================= login ============================
userRoutes.get('/login',auth.isLogout,userController.loadLogin)
userRoutes.post('/clickedLogin',auth.isLogout,userController.loginClickedLoadHome)

//============================== signup =============================
userRoutes.get('/signup',auth.isLogout,userController.loadSignup)

//============================= OTP ================================
userRoutes.post('/clickedSignup',auth.isLogout,userController.loadOtp)
userRoutes.post('/verify',userController.OtpClickedLoadHome)
userRoutes.get('/resendOtp',userController.resendOtp)
userRoutes.get('/otpPage',userController.otpPage)

// ==========================Home product ==========================
userRoutes.post('/productSearch',userController.productSearch)
userRoutes.get('/productDetails',userController.loadProduct)

//============================== logout ===============================
userRoutes.get('/logout',userController.logout)

//============================ user profile ========================
userRoutes.get('/profile',auth.isLogin,userController.loadProfile)
userRoutes.get('/addAddress',auth.isLogin,userController.loadAddAddress)
userRoutes.post('/addedAddress',auth.isLogin,addressController.addedAddress)
userRoutes.get('/editAddress',auth.isLogin,addressController.editAddress)
userRoutes.get('/removeAddress',auth.isLogin,addressController.removeAddress)
userRoutes.post('/update',auth.isLogin,addressController.updateAddress)
userRoutes.get('/editProfile',auth.isLogin,addressController.editProfile)
userRoutes.post('/profileUpdated',auth.isLogin,addressController.editedUser)

//========================= Forget Password =============================
userRoutes.get('/forgetEmail',userController.enterEmail)
userRoutes.post('/enteredEmail',userController.enteredEmail)
userRoutes.get('/forgetPassword',userController.forgetPassSendOtp)
userRoutes.post('/verifyForgetOtp',userController.forgetOtpVerified)
userRoutes.get('/resendForgetOtp',userController.forgetResendOtp)
userRoutes.post('/newPassword',userController.passwordChanged)

//=========================== Add to cart ===========================
userRoutes.get('/cart',cartController.loadCart)
userRoutes.post('/addToCart',cartController.addToCart)

//============================ Remove from cart =========================
userRoutes.post('/removeCartItem',auth.isLogin,cartController.removeFromCart)

//=========================== Quantity updation =========================
userRoutes.post('/cartQuantityUpdation',auth.isLogin,cartController.cartQuantityUpdation)

//=============================== checkout ===========================
userRoutes.get('/checkout',auth.isLogin,cartController.loadcheckout)

//================================ thankyou ===============================
userRoutes.post('/placeOrder',auth.isLogin,orderController.placeOrder)
userRoutes.get('/thankyou',auth.isLogin,orderController.thankyou)

//================================= Orders ===============================
userRoutes.get('/orders',auth.isLogin,orderController.orders)
userRoutes.get('/viewOrderDetails',auth.isLogin,orderController.viewOrderDetails)
userRoutes.post('/cancelOrder',orderController.cancelOrder)
userRoutes.post('/returnOrder',orderController.returnOrder)

//=============================== Shop ====================================
userRoutes.get('/shop',userController.loadShop)
userRoutes.post('/filter',userController.filter)

//=========================== Apply coupon ===========================
userRoutes.post('/applyCoupon',auth.isLogin,couponController.applyCoupon)

//=============================== wishlist =============================
userRoutes.get('/wishlist',wishlistController.loadWishlist)
userRoutes.post('/addToWishlist',wishlistController.addToWishlist)
userRoutes.post('/removeWish',wishlistController.removeWishItem)

//============================= payment ===========================
userRoutes.post('/verify-payment',auth.isLogin,orderController.verifyPayment)

//============================ review ==========================
userRoutes.post('/submitReview',reviewController.submitReview)

//==================== module Exports =========================
module.exports = userRoutes