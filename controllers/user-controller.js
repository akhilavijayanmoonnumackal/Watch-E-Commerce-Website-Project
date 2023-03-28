const db=require('../config/connection');
const collection=require('../config/collections');
const bcrypt=require('bcrypt')
const userHelpers=require('../helpers/user-helpers');
const { response } = require('express');
const twilioApi = require('../api/twilio') ;
const { verifyOtp } = require('../api/twilio');
const productHelpers = require('../helpers/product-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const adminController = require('./admin-controller');
let userHeader;

module.exports={
    get:async(req,res)=>{        
        let count = 0;
        let banner = await adminController.getAllBanners();
        if(req.session.loggedIn){
            let user=req.session.user;
            console.log(user);
            let product = await userHelpers.cartDetails(req.session.user._id)
            count = product.length; 
            console.log(banner)
            res.render('user/home',{admin:false,user,count,banner, userHeader:true});         
        }else{
            res.render('user/home',{admin:false,count,banner, userHeader:true});  
        }
              
        // productHelpers.viewProducts().then((products) => {
        //     res.render("user/home", {user,count,products, userHeader:true});
        // })       
    },

    
    // get:async(req,res)=>{        
    //     let count = 0;
    //     let user=req.session.user;
    //     if(req.session.user) {
    //         count = await userHelpers.getCartCount(req.session.user._id)
    //     }
    //     res.render("user/home", {user,count, userHeader:true});
    //     // productHelpers.viewProducts().then((products) => {
    //     //     res.render("user/home", {user,count, userHeader:true});
    //     // })       
    // },
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
        // req.session.destroy();
        req.session.loggedIn=false;
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
                req.session.loggedIn=true;
                res.json({status : true})                          
            }
            else{               
                res.json({status : false})
            }
        })
    },
    shop:async(req,res)=>{
        let count=0;
        if(req.session.loggedIn){
            let user=req.session.user;
            let product = await userHelpers.cartDetails(req.session.user._id)
            let count = product.length;        
            productHelpers.viewProducts().then((products)=>{
                res.render('user/shop',{admin:false,products,user,count, userHeader:true});
                console.log(products);
            })
        }else{
            productHelpers.viewProducts().then((products)=>{
                res.render('user/shop',{admin:false,products,count, userHeader:true});
                console.log(products);
            })
        }
    },
    // productDetail: async(req,res) => {
    //     let count=0;
    //     let Id=req.params.id;
    //     if(req.session.loggedIn) {
    //         let user=req.session.user;            
    //         let product = await userHelpers.cartDetails(req.session.user._id)
    //         let count = product.length;
    //         productHelpers.getProductDetails(Id).then((product) => {
    //             console.log(product);
    //             res.render('user/productDetail',{admin:false,count, product, user,userHeader:true});
    //         })
    //     }else{
    //         productHelpers.getProductDetails(Id).then((product) => {
    //             res.render('user/productDetail',{admin:false, product,count,userHeader:true})
    //         })
    //     }
    // },
    productDetail:async(req,res)=>{
        console.log(req.params.id);
        if(req.session.loggedIn){
            let user=req.session.user;
            // let userName=req.session.user;
            let Id=req.params.id;
            console.log(req.params.id);
            let product = await userHelpers.cartDetails(req.session.user._id)
            let count = product.length;
            productHelpers.getProductDetails(Id).then((product)=>{
                console.log(product);
                res.render('user/productDetail',{admin:false,count, product, user,userHeader:true});
            })
        }else{
            res.render('user/login');
        }       
    },
    
    addToCart: (req,res) => {
        if(req.session.loggedIn) {
            //console.log("hello")
            let productId = req.query.productId;
            console.log(productId);
            // console.log("gotit");
            let userId = req.session.user._id;
            let quantity= 1;
            try{
                if(parseInt(req.quantity)>1){
                    quantity=req.quantity
                }
            }catch(err){
                console.log(err);
            }finally{
                userHelpers.addToCart(userId,productId,quantity).then(() => {
                    res.json={
                        success: true
                    }
                });
            }
            // console.log(quantity)
            
        }else{
            res.redirect('/login');
        }
    },
    
    cartDetails: async(req,res) => {
        let count=0;
        if(req.session.loggedIn){
            let user=req.session.user;
            let product = await userHelpers.cartDetails(req.session.user._id)
            //let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
            let totalAmount = await userHelpers.get1TotalAmount(req.session.user._id)
            let count = product.length;
            console.log("count: ", count);
            if(count>0) {
                console.log("count: ", count);            
                console.log("totalvalue:",totalAmount);
                res.render('user/cart', { product,count,totalAmount,user, userHeader:true })
            }else{
                res.render('user/cartEmptySvg' , {userHeader:true,user, count})
            }            
        }else{
            res.render('user/cartSvg', {userHeader:true, count});
        }
    },
    
    changeProductQuantity: (req,res) => {
        console.log(req.body);
        const userId = req.session.user._id
        userHelpers.changeProductQuantity(req.body, userId).then(async(response) => {
            let user=req.session.user;
            // response.total=await userHelpers.getTotalAmount(req.body.user)
            // console.log(response.total);
            // res.json(response);
            // let product = await userHelpers.cartDetails(req.session.user._id)
            // let count = product.length;
            console.log("come")
            let count = await userHelpers.getCartCount(userId)
            console.log("go")
            console.log(count);
            if(count!=0){
                response.total=await userHelpers.get1TotalAmount(userId)
                console.log(response.total);
            }
            res.json(response)
        })
    },
    // changeProductQuantity: (req,res) => {
    //     //console.log(req.body);
    //     userHelpers.changeProductQuantity(req.body).then(async(response) => {
    //         response.total=await userHelpers.getTotalAmount(req.body.user)
    //         console.log(response.total);
    //         res.json(response);
    //         // let count = await userHelpers.getCartCount(req.session.user._id)
    //         // if(count!=0){
    //         //     response.total=await userHelpers.getTotalAmount(req.body.user)
    //         // }
    //         // res.json(response)
    //     })
    // },
    removeProduct: (req,res) => {
        const proId = req.params.id;
        const userId = req.session.user._id;
        userHelpers.removeProduct(userId, proId).then(() => {
            res.json({status: true})
        })
    },
    // removeCartProduct: (req,res) => {
    //     userHelpers.removeCartProduct(req.body).then(async(response) => {
    //         res.json(response)
    //     })
    // },

    // getTotalAmount: async(req,res) => {
    //     let count = null
    //     if(req.session.loggedIn==true) {
    //         count = await userHelpers.getCartCount(req.session.user._id)
    //         let allTotal = await userHelpers.getTotalAmount(req.session.user._id)
    //         res.render('user/place-order',{allTotal,count,user:true, user:req.session.user});
    //     }
    // },
    getWishList: (req,res) => {
        if(req.session.loggedIn){
            userHelpers.getWishList(req.session.user._id).then((response) => {
                res.json(response)
            })
        }else{
            res.redirect('/login');
        }
    },
    wishListDetails: async(req,res) => {
        if(req.session.loggedIn) {
            let user=req.session.user;
            let product = await userHelpers.cartDetails(req.session.user._id)
            let count = product.length;
            userHelpers.wishListDetails(req.session.user._id).then((products) => {
                // console.log(response);
                res.render('user/wishList',{admin:false,user,count,products,userHeader:true })
            });
        }else{
            res.redirect('/login');
        }
    },
    addToWishlist : (req, res)=>{
        if(req.session.loggedIn){
            let productId = req.query.productId;
            let userId = req.session.user._id;
            userHelpers.addToWishlist(userId, productId).then((response)=>{
                console.log(response)
            })
        }else{
            res.redirect('/login');
        }
    },

    BannerList :  (req, res)=>{
        let banner =  adminController.listBanner();


    },
    getPlaceOrder: async(req,res) => {
        if(req.session.loggedIn) {
            let user = req.session.user;
            let total = await userHelpers.get1TotalAmount(req.session.user._id);
            res.render('user/placeOrder',{admin:false,user,total, userHeader:true})
        }else{
            res.render('/login')
        }
    },
    postPlaceOrder: async(req,res) => {
        let products= await userHelpers.cartDetails(req.body.userId)
        let totalPrice = await userHelpers.get1TotalAmount(req.body.userId)
        userHelpers.placeOrder(req.body,products,totalPrice).then((orderId) => {
            console.log(orderId);
            if(req.body['payment-method'] === 'COD') {
                res.json({ codSuccess: true})
            }
        })
        console.log(req.body);
    },
    orderSuccess: (req,res) => {
        res.render('user/orderSuccess', {user:req.session.user})
    },
    userProfile: (req,res) => {
        if(req.session.loggedIn) {
            let user = req.session.user;
            res.render('user/userProfile', {admin:false,user,userHeader:true})
        }else{
            res.redirect('/login')
        }
    },
    addAddressPost: async(req,res) => {
        userHelpers.updateAddress(req.body,req.params.id);
        let user = await findUser(req.params.id);
        req.session.user = user;
        res.redirect('/userProfile')
    }    
}

