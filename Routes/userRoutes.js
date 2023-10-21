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

//========================= parsing setup ========================
userRoutes.use(express.json())
userRoutes.use(express.urlencoded({extended:true}))

// ======================= view engine setup =======================
userRoutes.set('view engine','ejs')
userRoutes.set('views','./views/userView')

//=============================== Route setup =====================
// ================================== Home ========================
userRoutes.get('/',auth.isLogout,userController.loadHome)
userRoutes.get('/home',auth.isLogin,userController.loadHome)

//============================= login ============================
userRoutes.get('/login',auth.isLogout,userController.loadLogin)
userRoutes.post('/clickedLogin',auth.isLogout,userController.loginClickedLoadHome)

//============================== signup =============================
userRoutes.get('/signup',auth.isLogout,userController.loadSignup)

//============================= OTP ================================
userRoutes.post('/clickedSignup',userController.loadOtp)
userRoutes.post('/verify',userController.OtpClickedLoadHome)
userRoutes.get('/resendOtp',userController.resendOtp)
userRoutes.get('/otpPage',userController.otpPage)

// ==========================Home product ==========================
userRoutes.post('/productSearch',userController.productSearch)
userRoutes.get('/productDetails',userController.loadProduct)

//============================== logout ===============================
userRoutes.get('/logout',userController.logout)

//============================ user profile ========================
userRoutes.get('/profile',userController.loadProfile)
userRoutes.get('/addAddress',userController.loadAddAddress)
userRoutes.post('/addedAddress',addressController.addedAddress)
userRoutes.get('/editAddress',addressController.editAddress)
userRoutes.get('/removeAddress',addressController.removeAddress)
userRoutes.post('/update',addressController.updateAddress)
userRoutes.get('/editProfile',addressController.editProfile)
userRoutes.post('/profileUpdated',addressController.editedUser)

//========================= Forget Password =============================
userRoutes.get('/forgetPassword',userController.forgetPassSendOtp)
userRoutes.post('/verifyForgetOtp',userController.forgetOtpVerified)
userRoutes.get('/resendForgetOtp',userController.forgetResendOtp)
userRoutes.post('/newPassword',userController.passwordChanged)

//=========================== Add to cart ===========================
userRoutes.get('/cart',cartController.loadCart)
userRoutes.post('/addToCart',cartController.addToCart)

//============================ Remove from cart =========================
userRoutes.post('/removeCartItem',cartController.removeFromCart)

//=========================== Quantity updation =========================
userRoutes.post('/cartQuantityUpdation',cartController.cartQuantityUpdation)

//=============================== checkout ===========================
userRoutes.get('/checkout',cartController.loadcheckout)

//================================ thankyou ===============================
userRoutes.post('/placeOrder',orderController.placeOrder)
userRoutes.get('/thankyou',orderController.thankyou)

//================================= Orders ===============================
userRoutes.get('/orders',orderController.orders)
userRoutes.get('/viewOrderDetails',orderController.viewOrderDetails)

//=============================== Shop ====================================
userRoutes.get('/shop',userController.loadShop)
userRoutes.post('/filter',userController.filter)

//=========================== Apply coupon ===========================
userRoutes.post('/applyCoupon',couponController.applyCoupon)

//=============================== wishlist =============================
userRoutes.get('/wishlist',wishlistController.loadWishlist)
userRoutes.post('/addToWishlist',wishlistController.addToWishlist)
userRoutes.post('/removeWish',wishlistController.removeWishItem)
userRoutes.post('/verify-payment',orderController.verifyPayment)

//==================== module Exports =========================
module.exports = userRoutes