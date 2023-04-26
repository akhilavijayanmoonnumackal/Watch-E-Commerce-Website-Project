var express = require('express');
var router = express.Router();
const controller=require('../controllers/user-controller');
const sessionChecker = require('../middleware/session');
const productHelpers=require('../helpers/product-helpers')
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const adminController = require('../controllers/admin-controller');
const { route } = require('./admin');


/* GET home page. */
router.get('/', controller.get);
router.get('/login', controller.userLogin)
router.post('/login', controller.userLoginPost)
router.get('/signup', controller.userSignup)
router.post('/signup', controller.userSignupPost)
router.get('/logout', controller.userLogout)
router.route('/otp-login').get(sessionChecker.checkforUser,controller.otpLogin)
router.post('/send-otp',controller.sendOtp);
router.post('/verify-otp',controller.verifyOtp);
router.post('/resend-otp',controller.resendOtp);
router.get('/shop',controller.shop);
router.get('/productDetail/:id',controller.productDetail);

//cart & wishlist
router.get('/addToCart/:id', controller.addToCart);
router.get('/cart',sessionChecker.userAuth, controller.cartDetails);
router.post('/change-product-quantity', controller.changeProductQuantity);
router.get('/remove-cart-product/:id', controller.removeProduct);
router.get('/wishList',sessionChecker.userAuth, controller.wishListDetails);
router.get('/addToWishlist/:id', controller.addToWishlist);
router.get('/removeWishlistProduct/:id', controller.removeWishlistProduct);

//place-order_routes
router.get('/place-order',sessionChecker.userAuth, controller.getPlaceOrder);
router.post('/place-order', controller.postPlaceOrder);
router.post('/verifyPayment', controller.verifyPayment);
router.get('/orderSuccess',sessionChecker.userAuth, controller.orderSuccess);

//userProfile_routes
router.get('/userProfile',sessionChecker.userAuth, controller.userProfile);
router.post('/profileInformation/:id', controller.editProfileInfo);
router.get('/manageAddress', sessionChecker.userAuth, controller.getAddress);
router.post('/addAddress/:id', controller.addAddressPost);
router.get('/removeProfileAddress/:id', controller.removeProfileAddress);

//allOrders_routes
router.get('/viewOrders',sessionChecker.userAuth, controller.viewOrders);
router.get('/singleOrderDetailUser/:id',sessionChecker.userAuth, controller.singleOrderDetailUser);
router.get('/cancelOrder/:id', controller.cancelOrder);
router.get('/returnOrder/:id', sessionChecker.userAuth, controller.returnOrder);
// router.post('/verifyPayment', controller.verifyPayment);

//forgotPassword_routes
router.get('/forgotPassword', controller.getForgotPassword);
router.post('/forgotPassword-otp', controller.forgotPasswordOtp);
router.post('/forgotPasswordVerify', controller.forgotPasswordVerify);
router.get('/newPasswordUpdate', controller.newPasswordUpdate);
router.post('/newPasswordUpdatePost', controller.newPasswordUpdatePost);

//search_routes
router.get('/search', controller.search);

//wallet_routes
router.get('/wallet', sessionChecker.userAuth, controller.getWallet);

// coupon_routes
router.post('/couponApply', sessionChecker.userAuth, controller.couponApply);



// router.get('/shop', (req,res)=>{
//   res.render('user/shop')
// })

module.exports=router;