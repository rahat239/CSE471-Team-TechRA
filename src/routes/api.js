const express=require('express');
const ProductController=require('../controllers/ProductController')
const UserController=require('../controllers/UserController')
const WishListController=require('../controllers/WishListController')
const CartListController=require('../controllers/CartListController')
const InvoiceController = require("../controllers/InvoiceController");
const FeaturesController = require("../controllers/FeaturesController");

const AuthVerification=require('../middlewares/AuthVerification')


const router=express.Router();


// Product
router.get('/ProductBrandList',ProductController.ProductBrandList)
router.get('/ProductCategoryList',ProductController.ProductCategoryList)
router.get('/ProductSliderList',ProductController.ProductSliderList)
router.get('/ProductListByBrand/:BrandID',ProductController.ProductListByBrand)
router.get('/ProductListByCategory/:CategoryID',ProductController.ProductListByCategory)
router.get('/ProductListBySimilar/:CategoryID',ProductController.ProductListBySimilar)
router.get('/ProductListByKeyword/:Keyword',ProductController.ProductListByKeyword)
router.get('/ProductListByRemark/:Remark',ProductController.ProductListByRemark)
router.get('/ProductDetails/:ProductID',ProductController.ProductDetails)
router.get('/ProductReviewList/:ProductID',ProductController.ProductReviewList)

router.post('/ProductListByFilter',ProductController.ProductListByFilter);


// User
router.get('/UserOTP/:email',UserController.UserOTP)
router.get('/VerifyLogin/:email/:otp',UserController.VerifyLogin)
router.get('/UserLogout',AuthVerification,UserController.UserLogout)
router.post('/CreateProfile',AuthVerification,UserController.CreateProfile)
router.post('/UpdateProfile',AuthVerification,UserController.UpdateProfile)
router.get('/ReadProfile',AuthVerification,UserController.ReadProfile)



// Wish
router.post('/SaveWishList',AuthVerification,WishListController.SaveWishList)
router.post('/RemoveWishList',AuthVerification,WishListController.RemoveWishList)
router.get('/WishList',AuthVerification,WishListController.WishList)



// Cart
router.post('/SaveCartList',AuthVerification,CartListController.SaveCartList)
router.post('/UpdateCartList/:cartID',AuthVerification,CartListController.UpdateCartList)
router.post('/RemoveCartList',AuthVerification,CartListController.RemoveCartList)
router.get('/CartList',AuthVerification,CartListController.CartList)

// Invoice & Payment
router.get('/CreateInvoice',AuthVerification,InvoiceController.CreateInvoice)










router.get('/InvoiceList',AuthVerification,InvoiceController.InvoiceList)
router.get('/InvoiceProductList/:invoice_id',AuthVerification,InvoiceController.InvoiceProductList)


router.post('/PaymentSuccess/:trxID',InvoiceController.PaymentSuccess)
router.post('/PaymentCancel/:trxID',InvoiceController.PaymentCancel)
router.post('/PaymentFail/:trxID',InvoiceController.PaymentFail)
router.post('/PaymentIPN/:trxID',InvoiceController.PaymentIPN)


// Features
router.get('/FeaturesList',FeaturesController.FeaturesList)
router.get('/LegalDetails/:type',FeaturesController.LegalDetails)

// Create Review
router.post('/CreateReview',AuthVerification,ProductController.CreateReview)



// src/routes/api.js






const AdminController = require('../controllers/AdminController');
const { getRecommendation } = require('../controllers/AIController');

const isAdmin = require('../middlewares/isAdmin');


// --- Admin sub-router ---
const adminRouter = require('./admin');
router.use('/admin', adminRouter);
router.get('/metrics', AuthVerification, isAdmin, AdminController.metrics);

// --- AI ---
const aiRouter = express.Router();
aiRouter.post('/predict', getRecommendation);
router.use('/ai', aiRouter);

// --- Products ---
router.get('/products', ProductController.getAllProducts);
router.get('/products/brand-list', ProductController.ProductBrandList);
router.get('/products/category-list', ProductController.ProductCategoryList);
router.get('/products/slider-list', ProductController.ProductSliderList);
router.get('/products/list-by-brand/:brandId', ProductController.ProductListByBrand);
router.get('/products/list-by-category/:categoryId', ProductController.ProductListByCategory);
router.get('/products/list-by-similar/:categoryId', ProductController.ProductListBySimilar);
router.get('/products/list-by-keyword/:keyword', ProductController.ProductListByKeyword);
router.get('/products/list-by-remark/:remark', ProductController.ProductListByRemark);
router.post('/products/list-by-filter', ProductController.ProductListByFilter);
router.get('/products/:productId', ProductController.ProductDetails);
router.get('/products/:productId/reviews', ProductController.ProductReviewList);
router.post('/products/:productId/review', AuthVerification, ProductController.CreateReview);

// --- Users ---
router.get('/users/otp/:email', UserController.UserOTP);
router.get('/users/verify/:email/:otp', UserController.VerifyLogin);
router.get('/users/logout', AuthVerification, UserController.UserLogout);
router.post('/profile', AuthVerification, UserController.CreateProfile);
router.put('/profile', AuthVerification, UserController.UpdateProfile);
router.get('/profile', AuthVerification, UserController.ReadProfile);

// --- WishList ---
router.post('/wishlist/save', AuthVerification, WishListController.SaveWishList);
router.post('/wishlist/remove', AuthVerification, WishListController.RemoveWishList);
router.get('/wishlist', AuthVerification, WishListController.WishList);

// --- Cart ---
router.post('/cart/save', AuthVerification, CartListController.SaveCartList);
router.post('/cart/update/:cartId', AuthVerification, CartListController.UpdateCartList);
router.post('/cart/remove', AuthVerification, CartListController.RemoveCartList);
router.get('/cart', AuthVerification, CartListController.CartList);

// --- Invoice & Payment ---
router.get('/invoice/create', AuthVerification, InvoiceController.CreateInvoice);
router.get('/invoice/list', AuthVerification, InvoiceController.InvoiceList);
router.get('/invoice/products/:invoiceId', AuthVerification, InvoiceController.InvoiceProductList);
router.post('/payment/success/:trxID', InvoiceController.PaymentSuccess);
router.post('/payment/cancel/:trxID', InvoiceController.PaymentCancel);
router.post('/payment/fail/:trxID', InvoiceController.PaymentFail);
router.post('/payment/ipn/:trxID', InvoiceController.PaymentIPN);

// --- Features & Legal ---
router.get('/features', FeaturesController.FeaturesList);
router.get('/legal/:type', FeaturesController.LegalDetails);

module.exports = router;