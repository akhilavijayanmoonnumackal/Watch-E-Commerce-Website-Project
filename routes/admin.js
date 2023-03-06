var express = require('express');
var router = express.Router();
const adminController=require('../controllers/admin-controller');
const sessionChecker = require('../middleware/session');

/* GET users listing. */
// router.get('/', adminController.get);
router.get('/', adminController.adminLogin);
router.post('/admin-login', adminController.adminLoginPost);
router.get('/', adminController.dashBoard)
router.get('/adminLogout', adminController.adminLogout)
router.get('/user-management',adminController.userManage);
router.get('/blockUser/:id', adminController.blockUser);
router.get('/unblockUser/:id', adminController.unblockUser);

module.exports = router;
