// ====================== Express setup ========================
const express = require('express')
const adminRoutes = express()

// ====================== Controllers ==========================
const adminController = require('../Controllers/adminController')
const productController = require('../Controllers/productController')
const categoryController = require('../Controllers/categoryController')
const orderController = require('../Controllers/orderController')
const couponController = require('../Controllers/couponController')
const bannerController = require('../Controllers/bannerController')

//========================== Multer setup =========================
const multer = require('../MiddleWares/multer')

//========================== session setup =========================
const session = require('express-session')
adminRoutes.use(session({
      secret: 'ok',
      resave: false,
      saveUninitialized: false
}));

//========================== Body parser setup =========================
adminRoutes.use(express.json())
adminRoutes.use(express.urlencoded({extended:true}))

//=========================== view engine setup ======================== 
adminRoutes.set('view engine','ejs')
adminRoutes.set('views','./views/adminView')

// ============================== Admin login ==========================
adminRoutes.get('/',adminController.loadLogin)
adminRoutes.post('/clickedLogin',adminController.loadAdmin)

//============================== user managment =======================
adminRoutes.get('/userManagment',adminController.loadUserManagment)
adminRoutes.get('/blockUser',adminController.blockingUser)

//============================== product managment =========================================
adminRoutes.get('/productManagmen',productController.loadProductManagment)
adminRoutes.get('/addProduct',productController.addProduct)
adminRoutes.post('/addedProduct',multer.productImagesUpload,productController.addedProduct)
adminRoutes.get('/deleteProduct',productController.deleteProduct)
adminRoutes.get('/editProduct',productController.editProduct)
adminRoutes.post('/prodectEdited',multer.productImagesUpload,productController.prodectEdited)

//============================== Category managment =======================
adminRoutes.get('/categoryManagment',categoryController.loadCategory)
adminRoutes.get('/addCategory',categoryController.clickedAddCategory)
adminRoutes.post('/addedCategory',categoryController.addedCategory)
adminRoutes.get('/blockCategory',categoryController.blockCategory)
adminRoutes.get('/deleteCategory',categoryController.deleteCategory)

//=============================== Order managment ==========================
adminRoutes.get('/orderManagment',orderController.loadOrderManagment)
adminRoutes.get('/orderDetails',orderController.orderDetails)
adminRoutes.get('/delivered',orderController.delivered)
adminRoutes.get('/cancelled',orderController.cancelled)

//============================= coupon managment ===============================
adminRoutes.get('/couponManagment',couponController.couponManagment)
adminRoutes.get('/addCoupon',couponController.addCoupon)
adminRoutes.post('/addedCoupon',couponController.addedCoupon)
adminRoutes.get('/block-coupons',couponController.blockingCoupon)
adminRoutes.get('/edit-coupon-page',couponController.editCoupon)
adminRoutes.post('/editedCoupon',couponController.editedCoupon)

// =========================== Banner managment ===============================
adminRoutes.get('/bannerManagment',bannerController.loadBannerManagment)
adminRoutes.post('/addedBanner',multer.bannerUpload.single('image'),bannerController.addedBanner)
adminRoutes.get('/addBanner',bannerController.addBanner)
adminRoutes.get('/edit-banner-page',bannerController.editBanner)
adminRoutes.post('/editedBanner',multer.bannerUpload.single('image'),bannerController.editedBanner)
adminRoutes.get('/blockBanner',bannerController.blockBanner)

// =========================== Logout ========================
adminRoutes.get('/logout',adminController.logout)

//==================== module Exports =========================
module.exports =  adminRoutes 