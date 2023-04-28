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
router.get('/user-management', sessionChecker.adminAuth, adminController.userManage);
router.get('/blockUser/:id', sessionChecker.adminAuth, adminController.blockUser);
router.get('/unblockUser/:id', sessionChecker.adminAuth, adminController.unblockUser);

//banner_router
router.get('/bannerManagement', sessionChecker.adminAuth, adminController.bannerManagement);
router.get('/add-banner', sessionChecker.adminAuth, adminController.addBannerGet);
router.post('/add-banner', sessionChecker.adminAuth, upload.single("image"), adminController.addBannerPost);
router.get('/list-banner/:id', sessionChecker.adminAuth, adminController.listBanner);
router.get('/unlist-banner/:id', sessionChecker.adminAuth, adminController.unlistBanner);
router.get('/edit-banner/:id', sessionChecker.adminAuth, adminController.editBanner);
router.post('/edit-banner/:id', sessionChecker.adminAuth, adminController.editBannerPost);
router.get('/deleteBanner/:id', sessionChecker.adminAuth, adminController.deleteBanner);

//cateogory_router
router.post('/addCategory', sessionChecker.adminAuth, adminController.addCategoryPost);
router.get('/category', sessionChecker.adminAuth, adminController.categoryManagement);
router.get('/listcategory/:id', sessionChecker.adminAuth, adminController.listcategory);
router.get('/unlistcategory/:id', sessionChecker.adminAuth, adminController.unlistcategory);
router.post('/editCategory/:id', sessionChecker.adminAuth, adminController.editCategoryPost);

//products_router
router.get('/view-products', sessionChecker.adminAuth, adminController.viewAdminProducts);
router.get('/add-product', sessionChecker.adminAuth, adminController.addProductGet);
router.post('/add-product', sessionChecker.adminAuth, upload.array("image"), adminController.addProductPost);
router.get('/editProduct/:id', sessionChecker.adminAuth, adminController.editProduct);
router.post('/editProduct/:id', sessionChecker.adminAuth, upload.array("image"), adminController.editProductPost);
router.get('/listProduct/:id', sessionChecker.adminAuth, adminController.listProduct);
router.get('/unlistProduct/:id', sessionChecker.adminAuth, adminController.unlistProduct);

//coupon_router
router.get('/coupon', sessionChecker.adminAuth, adminController.getCoupons);
router.post('/addCoupon', sessionChecker.adminAuth, adminController.addCouponPost);
router.get('/activateCoupon/:id', sessionChecker.adminAuth, adminController.activateCoupon);
router.get('/deactivateCoupon/:id', adminController.deactivateCoupon);
router.post('/editCoupon/:id', sessionChecker.adminAuth, adminController.editCouponPost);
router.get('/deleteCoupon/:id', sessionChecker.adminAuth, adminController.deleteCoupon);

//oredr_router
router.get('/orderManagement', sessionChecker.adminAuth, sessionChecker.adminAuth, adminController.orderManagement);
router.get('/singleOrderDetail/:id', sessionChecker.adminAuth, sessionChecker.adminAuth, adminController.singleOrderDetail);
router.get('/cancelOrder/:id', sessionChecker.adminAuth, adminController.cancelOrder);
router.get('/shipOrder/:id', sessionChecker.adminAuth, adminController.shipOrder);
router.get('/orderDelivered/:id', sessionChecker.adminAuth, adminController.orderDelivered);

//chart
router.get('/chart-details', sessionChecker.adminAuth, adminController.chartDetails);

//sales
router.get('/salesReport', sessionChecker.adminAuth, adminController.salesReport);
module.exports = router;
