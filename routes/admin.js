var express = require('express');
var router = express.Router();
const adminController=require('../controllers/admin-controller');
const sessionChecker = require('../middleware/session');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');

/* GET users listing. */
router.route('/admin-login').get(adminController.adminLogin).post(adminController.adminLoginPost); 
router.get('/', sessionChecker.adminAuth, adminController.dashBoard)
router.get('/adminLogout', adminController.adminLogout)
router.get('/user-management', adminController.userManage);
router.get('/blockUser/:id', adminController.blockUser);
router.get('/unblockUser/:id', adminController.unblockUser);
router.get('/bannerManagement', sessionChecker.adminAuth, adminController.bannerManagement);
router.get('/add-banner', adminController.addBannerGet);
router.post('/add-banner', upload.single("image"), adminController.addBannerPost);
router.get('/list-banner/:id', adminController.listBanner);
router.get('/unlist-banner/:id', adminController.unlistBanner);
router.get('/edit-banner/:id', adminController.editBanner);
router.post('/edit-banner/:id', adminController.editBannerPost);
router.get('/deleteBanner/:id', adminController.deleteBanner);
router.post('/addCategory', adminController.addCategoryPost);
router.get('/category', sessionChecker.adminAuth, adminController.categoryManagement);
router.get('/listcategory/:id', adminController.listcategory);
router.get('/unlistcategory/:id', adminController.unlistcategory);
router.post('/editCategory/:id', adminController.editCategoryPost);
router.get('/view-products', sessionChecker.adminAuth, adminController.viewProducts);
router.get('/add-product', sessionChecker.adminAuth, adminController.addProductGet);
router.post('/add-product', upload.array("image"), adminController.addProductPost);
router.get('/editProduct/:id', adminController.editProduct);
router.post('/editProduct/:id', upload.array("image"), adminController.editProductPost);
router.get('/listProduct/:id', adminController.listProduct);
router.get('/unlistProduct/:id', adminController.unlistProduct);
router.get('/coupon', sessionChecker.adminAuth, adminController.getCoupons);
router.post('/addCoupon', adminController.addCouponPost);
router.get('/activateCoupon/:id', adminController.activateCoupon);
router.get('/deactivateCoupon/:id', adminController.deactivateCoupon);
router.post('/editCoupon/:id', adminController.editCouponPost);
router.get('/deleteCoupon/:id', adminController.deleteCoupon);
router.get('/orderManagement', sessionChecker.adminAuth, adminController.orderManagement);
router.get('/singleOrderDetail/:id', sessionChecker.adminAuth, adminController.singleOrderDetail);
router.get('/cancelOrder/:id', adminController.cancelOrder);
router.get('/shipOrder/:id', adminController.shipOrder);
router.get('/orderDelivered/:id', adminController.orderDelivered);
router.get('chart-details', adminController.chartDetails);


router.get('/salesReport', adminController.salesReport);
module.exports = router;
