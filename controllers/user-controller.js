const db=require('../config/connection');
const collection=require('../config/collections');
const bcrypt=require('bcrypt')
const userHelpers=require('../helpers/user-helpers');
const { response } = require('express');
const twilioApi = require('../api/twilio') ;
const { verifyOtp } = require('../api/twilio');
const productHelpers = require('../helpers/product-helpers');
let userHeader;

module.exports={
    get:(req,res)=>{
        let user=req.session.user;
        res.render("user/home", {user, userHeader:true});
    },
    userLogin:(req,res)=>{
        if(req.session.loggedIn){
            res.redirect('/');
        }else{
            res.render('user/login', {loginErr:req.session.loginErr});
            req.session.loginErr=false
        }
    },
    userSignup:(req,res)=>{
        if(!req.session.loggedIn){
            res.render('user/signup');           
        }else{
            res.redirect('/');
        }
    },
    userSignupPost:(req,res)=>{
        userHelpers.doSignUp(req.body).then((response)=>{
            req.session.loggedIn=true;
            req.session.user=response;
            console.log(req.session.user);
            res.render('user/login')
        })
    },
    userLoginPost:(req,res)=>{
        userHelpers.doLogin(req.body).then((response)=>{
            console.log(response)
            if(response.status){   
                    if(response.isBlocked){
                        req.session.loggedIn=true;
                        req.session.user=response.user;
                        res.redirect('/');
                    }else if(response.isBlocked == false){
                        req.session.loginErr="user is blocked !!";
                        res.redirect('/login');
                    }                      
            }else{
                req.session.loginErr="Invalid username or password";
                res.redirect('/login')
            }
        })
    },
    userLogout:(req,res)=>{
        req.session.destroy();
        res.redirect('/login');
    },
    otpLogin : (req, res) =>{
       res.render('user/otp-login',{"loginErr": req.session.otpLoginErr});
       req.session.otpLoginErr = false;
    },
    sendOtp: (req, res)=>{       
       req.session.mobile = req.body.phone;
       userHelpers.checkForUser(req.body.phone).then(async (user) =>{
        if(user){
            req.session.user = user;
            await twilioApi.sendOtp(req.body.phone);
            res.json(true)
        }else{  
            req.session.user = null;
            req.session.otpLoginErr = "The phone number is not registerd with any account";
            res.json(false);
        }
       
       })
    },
    verifyOtp : (req, res) =>{
        twilioApi.verifyOtp(req.session.mobile, req.body.otp).then((result) =>{
            if(result === "approved"){
                res.json({status : true})
            }
            else{
                
                res.json({status : false})
            }
        })
    },
    shop:(req,res)=>{
        let user=req.session.user;
        productHelpers.viewProducts().then((products)=>{
            res.render('user/shop',{admin:false,products,user, userHeader:true});
            console.log(products);
        })
    },
    productDetail:(req,res)=>{
        console.log(req.params.id);
        if(req.session.loggedIn){
            let userName=req.session.user;
            let Id=req.params.id;
            console.log(req.params.id);
            productHelpers.getProductDetails(Id).then((product)=>{
                console.log(product);
                res.render('user/productDetail',{product,user:true,userName});
            })
        }else{
            res.render('user/login');
        }       
    },
    addToCart: (req,res) => {
        console.log('api call');
        userHelpers.addToCart(req.params.id,req.session.user._id).then(() => {
            res.json({ status: true})
        })
    },
    cart: async(req,res) => {
        if(req.session.loggedIn){
            //let userName=req.session.user;
            let products = await userHelpers.getCartProducts(req.session.user._id)
            let totalValue = 0
            if(products.length>0) {
                totalValue = await userHelpers.getTotalAmount(req.session.user._id)
            }
            console.log(products);
            res.render('user/cart', { products, totalValue, user: req.session.user })
        }
    },
    changeProductQuantity: (req,res,next) => {
        console.log(req.body);
        userHelpers.changeProductQuantity(req.body).then(async(response) => {
            let count = await userHelpers.getCartCount(req.session.user._id)
            if(count!=0){
                response.total=await userHelpers.getTotalAmount(req.body.user)
            }
            res.json(response)
        })
    },
    removeProduct: (req,res) => {
        userHelpers.removeProduct(req.body).then(() => {
            res.json({ status: true })
        })
    },
    getWishList: (req,res) => {
        if(req.session.loggedIn){
            userHelpers.getWishList(req.session.user._id).then((response) => {
                res.json(response)
            })
        }
    },
    wishListDetails: (req,res) => {
        if(req.session.loggedIn) {
            userHelpers.wishListDetails(req.session.user._id).then((response) => {
            res.render('user/wishList',{user: req.session.user })
            })
        }
    }
}

