var express = require('express');
var router = express.Router();
const adminController=require('../controllers/admin-controller');
const sessionChecker = require('../middleware/session');

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
router.get('/add-product', adminController.addProductGet)
router.post('/add-product', adminController.addProductPost)

module.exports = router;
