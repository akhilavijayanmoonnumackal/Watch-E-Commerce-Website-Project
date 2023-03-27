var express = require('express');
var router = express.Router();
const adminController=require('../controllers/admin-controller');
const sessionChecker = require('../middleware/session');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');

/* GET users listing. */
// router.get('/', adminController.get);
router.route('/admin-login').get(adminController.adminLogin).post(adminController.adminLoginPost); 
router.get('/', adminController.dashBoard)
router.get('/adminLogout', adminController.adminLogout)
router.get('/user-management',adminController.userManage);
router.get('/blockUser/:id', adminController.blockUser);
router.get('/unblockUser/:id', adminController.unblockUser);
router.get('/view-products', adminController.viewProducts);
//router.route('/add-product').get(adminController.addProductGet).post(adminController.addProductPost);
router.get('/add-product', adminController.addProductGet);
router.post('/add-product', upload.array("image"), adminController.addProductPost);
// router.post('/add-product', adminController.addProductPost)
router.get('/bannerManagement', adminController.bannerManagement);
router.get('/add-banner', adminController.addBannerGet);
router.post('/add-banner', upload.single("image"), adminController.addBannerPost);
router.get('/list-banner/:id', adminController.listBanner);
router.get('/unlist-banner/:id', adminController.unlistBanner);
router.get('/edit-banner/:id', adminController.editBanner);
router.post('/edit-banner/:id', adminController.editBannerPost);
//router.get('/category', adminController.viewCategory);
router.post('/addCategory', adminController.addCategoryPost);
router.get('/category', adminController.categoryManagement);
router.get('/listcategory/:id', adminController.listcategory);
router.get('/unlistcategory/:id', adminController.unlistcategory);
//router.get('/listCategoryOrUnlistCategory/:id', adminController.listCategoryOrUnlistCategory);
router.get('/editProduct/:id', adminController.editProduct);
router.post('/editProduct/:id',upload.array("image"), adminController.editProductPost);
router.get('/listProduct/:id', adminController.listProduct);
router.get('/unlistProduct/:id', adminController.unlistProduct);



module.exports = router;
