const { ObjectId } = require("mongodb");
const userHelpers = require("../helpers/user-helpers");

module.exports = {

    checkforUser : (req, res,next) =>{
        if(req.session.loggedIn){
            res.redirect('/');
        }
        else{
            next();
        }
    },
    checkforAdmin : (req,res,next)=>{
        if(req.session.admin){
            res.redirect('/admin')
        }
        else{
            next()
        }
    },
    adminAuth: (req,res,next) => {
        if(req.session.adminLoggedIn){
            next()
        }else{
            res.redirect('/admin/admin-login')
        }
    },
    userAuth: async(req, res, next)=>{
        if(req.session.loggedIn){
            // get user with req.session.userDetails
            const user = await userHelpers.findUser(req.session.user._id);
            // extract userId from the user document  // get cart or wishList with the userId
            const cartCount = await userHelpers.getCartCountNew(req.session.user._id);
            req.session.cartCount = parseInt(cartCount);
            // after you get cartProduct count , save that count in session. such as 1. req.session.cartCount, 2. req.session.wishlistCount   
            const wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
            req.session.wishlistCount = parseInt(wishlistCount);
            // you can retrieve count in every page from that session
            next();
        }else{
            res.redirect('/login');
        }
    },
    userAjaxAuth: async(req, res, next)=>{
        if(req.session.loggedIn){
            const user = await userHelpers.findUser(req.session.user._id);
            const cartCount = await userHelpers.getCartCountNew(req.session.user._id);
            req.session.cartCount = parseInt(cartCount);
            const wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
            req.session.wishlistCount = parseInt(wishlistCount);
            next();
        }else{
            res.json({
                status: "guest user"
            })
        }
    }
}