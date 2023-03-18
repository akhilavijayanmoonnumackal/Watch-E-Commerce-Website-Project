var express = require('express');
var router = express.Router();
const controller=require('../controllers/user-controller');
const sessionChecker = require('../middleware/session');
const productHelpers=require('../helpers/product-helpers')
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');

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
router.get('/checkout', controller.getTotalAmount);
router.post('/remove-cart-product', controller.removeCartProduct);
//router.get('/wishList', controller.getWishList);
router.get('/wishList', controller.wishListDetails);
router.get('/addToWishlist', controller.addToWishlist);



// router.get('/shop', (req,res)=>{
//   res.render('user/shop')
// })

module.exports=router;