var express = require('express');
var router = express.Router();
const controller=require('../controllers/user-controller');
const sessionChecker = require('../middleware/session');
const productHelpers=require('../helpers/product-helpers')
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const adminController = require('../controllers/admin-controller');

/* GET home page. */
router.get('/', controller.get);
router.get('/login', controller.userLogin)
router.post('/login',controller.userLoginPost)
router.get('/signup', controller.userSignup)
router.post('/signup', controller.userSignupPost)
router.get('/logout', controller.userLogout)
router.route('/otp-login').get(sessionChecker.checkforUser,controller.otpLogin)
router.post('/send-otp',controller.sendOtp);
router.post('/verify-otp',controller.verifyOtp);
router.get('/shop',controller.shop);
router.get('/productDetail/:id',controller.productDetail);
router.get('/addToCart', controller.addToCart);
router.get('/cart', controller.cartDetails);
router.post('/change-product-quantity', controller.changeProductQuantity);
//router.get('/checkout', controller.getTotalAmount);
router.get('/remove-cart-product/:id', controller.removeProduct);
//router.get('/wishList', controller.getWishList);
router.get('/wishList', controller.wishListDetails);
router.get('/addToWishlist', controller.addToWishlist);
router.get('/removeWishlistProduct/:id', controller.removeWishlistProduct);
router.get('/place-order', controller.getPlaceOrder);
router.post('/place-order', controller.postPlaceOrder);
router.get('/orderSuccess', controller.orderSuccess);
router.get('/userProfile', controller.userProfile);
router.post('/profileInformation/:id', controller.editProfileInfo);
//router.get('/addAddress', controller.getAddress);
router.post('/addAddress/:id', controller.addAddressPost);
// router.post('/applyCoupon', controller.applyCoupon);
router.get('/viewOrders', controller.viewOrders);
router.get('/singleOrderDetailUser/:id', controller.singleOrderDetailUser);
router.post('/verifyPayment', controller.verifyPayment);


// router.get('/shop', (req,res)=>{
//   res.render('user/shop')
// })

module.exports=router;