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
router.get('/shop',controller.shop);
router.get('/productDetail/:id',controller.productDetail);
router.get('/addToCart/:id', controller.addToCart);
router.get('/cart',sessionChecker.userAuth, controller.cartDetails);
router.post('/change-product-quantity', controller.changeProductQuantity);
router.get('/remove-cart-product/:id', controller.removeProduct);
router.get('/wishList',sessionChecker.userAuth, controller.wishListDetails);
router.get('/addToWishlist/:id', controller.addToWishlist);
router.get('/removeWishlistProduct/:id', controller.removeWishlistProduct);
router.get('/place-order',sessionChecker.userAuth, controller.getPlaceOrder);
router.post('/place-order', controller.postPlaceOrder);
router.get('/orderSuccess', controller.orderSuccess);
router.get('/userProfile',sessionChecker.userAuth, controller.userProfile);
router.post('/profileInformation/:id', controller.editProfileInfo);
router.get('/manageAddress', controller.getAddress);
router.post('/addAddress/:id', controller.addAddressPost);
// router.post('/applyCoupon', controller.applyCoupon);
router.get('/viewOrders',sessionChecker.userAuth, controller.viewOrders);
router.get('/singleOrderDetailUser/:id',sessionChecker.userAuth, controller.singleOrderDetailUser);
router.get('/cancelOrder/:id', controller.cancelOrder);
router.get('/returnOrder/:id', sessionChecker.userAuth, controller.returnOrder);
router.post('/verifyPayment', controller.verifyPayment);
router.get('/forgotPassword', controller.getForgotPassword);
router.post('/forgotPassword-otp', controller.forgotPasswordOtp);
router.post('/forgotPasswordVerify', controller.forgotPasswordVerify);
router.get('/newPasswordUpdate', controller.newPasswordUpdate);
router.post('/newPasswordUpdatePost', controller.newPasswordUpdatePost);
// router.post('/search', controller.search);
router.get('/search', controller.search);




// router.get('/shop', (req,res)=>{
//   res.render('user/shop')
// })

module.exports=router;