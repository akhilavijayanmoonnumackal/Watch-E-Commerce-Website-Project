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
const async = require('hbs/lib/async');
let userHeader;

module.exports={
    get:async(req,res)=>{        
        let cartCount = 0;
        let wishlistCount = 0;
        let banner = await adminController.getAllBanners();
        if(req.session.loggedIn){
            let user=req.session.user;
            cartCount = await userHelpers.getCartCountNew(req.session.user._id);
            req.session.cartCount = parseInt(cartCount);
            wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
            req.session.wishlistCount = parseInt(wishlistCount);

            console.log(user);
            // let product = await userHelpers.cartDetails(req.session.user._id);
            // let wishProduct = await userHelpers.wishListDetails(req.session.user._id);
            res.render('user/home',{admin:false,user,cartCount,banner, userHeader:true,wishlistCount});
                 
        }else{
            res.render('user/home',{admin:false,cartCount,banner,wishlistCount, userHeader:true});  
        }      
    },
    // get:async(req,res)=>{        
    //     let cartCount = 0;
    //     let wishlistCount = 0;
    //     let banner = await adminController.getAllBanners();
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         cartCount = await userHelpers.getCartCountNew(req.session.user._id);
    //         //req.session.cartCount = parseInt(cartCount);
    //         wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    //         //req.session.wishlistCount = parseInt(wishlistCount);

    //         try {
    //             cartCount = product.length;
    //             wishlistCount = products.length;
    //         }catch(err){
    //             console.log(err);
    //         }finally{
    //             if(cartCount>0 && wishlistCount>0) {
    //                 res.render('user/home',{admin:false,user,cartCount,banner, userHeader:true,wishlistCount});
    //             }else if(cartCount>0 && wishlistCount===0){
    //                 res.render('user/home',{admin:false,user,cartCount,banner, userHeader:true,wishlistCount}); 
    //             }
                
    //         }

    //         //console.log(user);
    //         // let product = await userHelpers.cartDetails(req.session.user._id);
    //         // let wishProduct = await userHelpers.wishListDetails(req.session.user._id);
            
                 
    //     }else{
    //         res.render('user/home',{admin:false,cartCount,banner,wishlistCount, userHeader:true});  
    //     }      
    // },

    // get:async(req,res)=>{        
    //     let cartCount = 0;
    //     let wishlistCount = 0;
    //     let banner = await adminController.getAllBanners();
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         console.log(user);
    //         let product = await userHelpers.cartDetails(req.session.user._id);
    //         let wishProduct = await userHelpers.wishListDetails(req.session.user._id);
            
    //         try{
    //             cartCount = product.length;
    //             wishlistCount = wishProduct.length;
    //         }catch(err){
    //             console.log(err)
    //         }finally{
    //             console.log(banner)
    //             if(cartCount>0) {
    //                 res.render('user/home',{admin:false,user,cartCount,banner, userHeader:true,wishlistCount}); 
    //             }else{
    //                 res.render('user/home',{admin:false,user,cartCount,banner, userHeader:true,wishlistCount}); 
    //             }
                   
    //         }     
    //     }else{
    //         res.render('user/home',{admin:false,cartCount,banner,wishlistCount, userHeader:true});  
    //     }      
    // },
    // get:async(req,res)=>{        
    //     let count = 0;
    //     let banner = await adminController.getAllBanners();
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         console.log(user);
    //         let product = await userHelpers.cartDetails(req.session.user._id)
    //         try{
    //             count = product.length;
    //         }catch(err){
    //             console.log(err)
    //         }finally{
    //             console.log(banner)
    //             if(count>0) {
    //                 res.render('user/home',{admin:false,user,count,banner, userHeader:true}); 
    //             }else{
    //                 res.render('user/home',{admin:false,user,count,banner, userHeader:true}); 
    //             }
                   
    //         }     
    //     }else{
    //         res.render('user/home',{admin:false,count,banner, userHeader:true});  
    //     }      
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
        req.session.cartCount=false;
        req.session.wishlistCount=false;
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
    // shop: async(req,res)=>{
    //     let cartCount = 0;
    //     let wishlistCount = 0;
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         cartCount = await userHelpers.getCartCountNew(req.session.user._id);
    //         req.session.cartCount = parseInt(cartCount);
    //         wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    //         req.session.wishlistCount = parseInt(wishlistCount);
    //         adminHelpers.getAllCategories().then((category) => {
    //             productHelpers.viewProducts().then((products)=>{
    //                 res.render('user/shop',{admin:false,products,user,category,cartCount,wishlistCount,userHeader:true});
    //                 console.log(products);
    //             })
    //         })
                                          
    //     }
    // },
    // shop: async(req,res)=>{
    //     let cartCount = 0;
    //     let wishlistCount = 0;
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         cartCount = await userHelpers.getCartCountNew(req.session.user._id);
    //         req.session.cartCount = parseInt(cartCount);
    //         wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
    //         req.session.wishlistCount = parseInt(wishlistCount);
    //         //let products = await userHelpers.cartDetails(req.session.user._id);
    //         // let wishProduct = await userHelpers.wishListDetails(req.session.user._id);
    //         // let wishlistCount = req.session.wishlistCount;
    //         productHelpers.viewProducts().then((products)=>{
    //             res.render('user/shop',{admin:false,user,cartCount,wishlistCount,userHeader:true,products});
    //             console.log(products);
    //         })
    //     }else{
    //         productHelpers.viewProducts().then((products)=>{
    //             res.render('user/shop',{admin:false,products,cartCount,wishlistCount,userHeader:true});
    //             console.log(products);
    //         })
    //     }
    // },
    shop: async(req,res)=>{
        let cartCount = 0;
        let wishlistCount = 0;
        if(req.session.loggedIn){
            let user=req.session.user;
            cartCount = await userHelpers.getCartCountNew(req.session.user._id);
            req.session.cartCount = parseInt(cartCount);
            wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
            req.session.wishlistCount = parseInt(wishlistCount);
            adminHelpers.getAllCategories().then((category) => {
                productHelpers.viewProducts().then((products)=>{
                    res.render('user/shop',{admin:false,user,cartCount,category, wishlistCount, userHeader:true,products});
                    console.log(products);
                })
            })
        }else{
            adminHelpers.getAllCategories().then((category) => {
                productHelpers.viewProducts().then((products)=>{
                    res.render('user/shop',{admin:false,products,cartCount,category,wishlistCount,userHeader:true});
                    console.log(products);
                })
            })            
        }
    },
    // shop: async(req,res)=>{
    //     let cartCount = 0;
    //     let wishlistCount = 0;
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         let product = await userHelpers.cartDetails(req.session.user._id);
    //         let wishProduct = await userHelpers.wishListDetails(req.session.user._id);
    //         // let wishlistCount = req.session.wishlistCount;
    //         try{
    //             cartCount = product.length; 
    //             wishlistCount = wishProduct.length;
    //         }catch{
    //             console.log("err");
    //         }finally{
    //             if(cartCount>0) {
    //                 adminHelpers.getAllCategories().then((category) => {
    //                     productHelpers.viewProducts().then((products)=>{
    //                         res.render('user/shop',{admin:false,products,user,category,cartCount,wishlistCount,userHeader:true});
    //                         console.log(products);
    //                     })
    //                 })
                    
    //             }else{
    //                 productHelpers.viewProducts().then((products)=>{
    //                     res.render('user/shop',{admin:false,products,user,cartCount,wishlistCount,userHeader:true});
    //                     console.log(products);
    //                 })
    //             }                
    //         }
    //     }else{
    //         productHelpers.viewProducts().then((products)=>{
    //             res.render('user/shop',{admin:false,products,cartCount,wishlistCount,userHeader:true});
    //             console.log(products);
    //         })
    //     }
    // },

    // get:async(req,res)=>{        
    //     let count = 0;
    //     let banner = await adminController.getAllBanners();
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         console.log(user);
    //         let product = await userHelpers.cartDetails(req.session.user._id)
    //         try{
    //             count = product.proDetails.length;
    //         }catch(err){
    //             console.log(err)
    //         }finally{
    //             console.log(banner)
    //             res.render('user/home',{admin:false,user,count,banner, userHeader:true});    
    //         }     
    //     }else{
    //         res.render('user/home',{admin:false,count,banner, userHeader:true});  
    //     }
              
    //     // productHelpers.viewProducts().then((products) => {
    //     //     res.render("user/home", {user,count,products, userHeader:true});
    //     // })       
    // },


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
    // productDetail:async(req,res)=>{
    //     let cartCount=0;
    //     let wishlistCount = 0;
    //     let Id=req.params.id;
    //     console.log(req.params.id);
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         // let userName=req.session.user;
    //         let Id=req.params.id;
    //         console.log(req.params.id);
    //         let product = await userHelpers.cartDetails(req.session.user._id);
    //         let wishProduct = await userHelpers.wishListDetails(req.session.user._id);
    //         try{
    //             cartCount = product.length;
    //             wishlistCount = wishProduct.length;
    //         }
    //         catch{
    //             console.log("err");
    //         }finally{
    //             if(cartCount>0) {
    //                 productHelpers.getProductDetails(Id).then((product)=>{
    //                     console.log(product);
    //                     res.render('user/productDetail',{admin:false,cartCount, product,wishlistCount, user,userHeader:true});
    //                 })
    //             }else{
    //                 productHelpers.getProductDetails(Id).then((product)=>{
    //                 console.log(product);
    //                 res.render('user/productDetail',{admin:false,cartCount, product,wishlistCount, user,userHeader:true});
    //             })
    //             }
                
    //         }
    //     }else{
    //         productHelpers.getProductDetails(Id).then((product)=>{
    //             console.log(product);
    //             res.render('user/productDetail',{admin:false,cartCount,wishlistCount, product,userHeader:true});
    //         })
    //     }       
    // },

    productDetail:async(req,res)=>{
        let cartCount=0;
        let wishlistCount = 0;
        let Id=req.params.id;
        console.log(req.params.id);
        if(req.session.loggedIn){
            let user=req.session.user;
            cartCount = await userHelpers.getCartCountNew(req.session.user._id);
            req.session.cartCount = parseInt(cartCount);
            wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
            req.session.wishlistCount = parseInt(wishlistCount);
            // let userName=req.session.user;
            let Id=req.params.id;
            console.log(req.params.id);
            // let product = await userHelpers.cartDetails(req.session.user._id);
            // let wishProduct = await userHelpers.wishListDetails(req.session.user._id);
            productHelpers.getProductDetails(Id).then((product)=>{
                    console.log(product);
                res.render('user/productDetail',{admin:false,cartCount,wishlistCount, product, user,userHeader:true});
            })
        }else{
            productHelpers.getProductDetails(Id).then((product)=>{
                console.log(product);
                res.render('user/productDetail',{admin:false,cartCount,wishlistCount, product,userHeader:true});
            })
        }       
    },
    // productDetail:async(req,res)=>{
    //     let cartCount=0
    //     console.log(req.params.id);
    //     if(req.session.loggedIn){
    //         let user=req.session.user;
    //         // let userName=req.session.user;
    //         let Id=req.params.id;
    //         console.log(req.params.id);
    //         let product = await userHelpers.cartDetails(req.session.user._id);
    //         try{
    //             cartCount = product.length;
    //         }
    //         catch{
    //             console.log("err");
    //         }finally{
    //             if(cartCount>0) {
    //                 productHelpers.getProductDetails(Id).then((product)=>{
    //                     console.log(product);
    //                     res.render('user/productDetail',{admin:false,cartCount, product, user,userHeader:true});
    //                 })
    //             }else{
    //                 productHelpers.getProductDetails(Id).then((product)=>{
    //                 console.log(product);
    //                 res.render('user/productDetail',{admin:false,cartCount, product, user,userHeader:true});
    //             })
    //             }
                
    //         }
    //     }else{
    //         res.render('user/login');
    //     }       
    // },
    
    addToCart: (req,res) => {
        if(req.session.loggedIn) {
            console.log("hello")
            let productId = req.params.id;
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
                userHelpers.addToCart(userId,productId,quantity).then((response) => {
                    console.log(response);
                    res.json({
                        message: "guest",
                        success: true
                    })
                });
            }
            // console.log(quantity)
            
        }else{
            res.redirect('/login');
        }
    },
    // addToCart: (req,res) => {
    //     if(req.session.loggedIn) {
    //         console.log("hello")
    //         let productId = req.query.productId;
    //         console.log(productId);
    //         // console.log("gotit");
    //         let userId = req.session.user._id;
    //         let quantity= 1;
    //         try{
    //             if(parseInt(req.quantity)>1){
    //                 quantity=req.quantity
    //             }
    //         }catch(err){
    //             console.log(err);
    //         }finally{
    //             userHelpers.addToCart(userId,productId,quantity).then(() => {
    //                 res.json={
    //                     success: true
    //                 }
    //             });
    //         }
    //         // console.log(quantity)
            
    //     }else{
    //         res.redirect('/login');
    //     }
    // },
    cartDetails: async(req,res) => {
        let user =req.session.user;
        let product = await userHelpers.cartDetails(req.session.user._id)
        let totalAmount = await userHelpers.get1TotalAmount(req.session.user._id);
        let cartCount = req.session.cartCount;
        console.log(`carrt count ::::: ${cartCount}`);
        let wishlistCount = req.session.wishlistCount;
        res.render('user/cart', {product,cartCount,wishlistCount,totalAmount,user, userHeader:true })
        if(cartCount===0){
            res.render('user/cartSvg', {product,cartCount,wishlistCount,totalAmount,user, userHeader:true })
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
        console.log("tttttttttttttttttttttttttt",req.params.id);
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
    // wishListDetails: async(req,res) => {
    //     if(req.session.loggedIn) {
    //         let user=req.session.user;
    //         let product = await userHelpers.cartDetails(req.session.user._id)
    //         let count = product.length;
    //         userHelpers.wishListDetails(req.session.user._id).then((products) => {
    //             // console.log(response);
    //             res.render('user/wishList',{admin:false,user,count,products,userHeader:true })
    //         });
    //     }else{
    //         res.redirect('/login');
    //     }
    // },

    // cartDetails: async(req,res) => {
    //     let user =req.session.user;
    //     let product = await userHelpers.cartDetails(req.session.user._id)
    //     let totalAmount = await userHelpers.get1TotalAmount(req.session.user._id);
    //     let cartCount = req.session.cartCount;
    //     console.log(`carrt count ::::: ${cartCount}`);
    //     let wishlistCount = req.session.wishlistCount;
    //     res.render('user/cart', {product,cartCount,wishlistCount,totalAmount,user, userHeader:true })
    // },

    wishListDetails: async(req,res) => {
        let user=req.session.user;
        let products = await userHelpers.wishListDetails(req.session.user._id)
        let wishlistCount = req.session.wishlistCount;               
        let cartCount = req.session.cartCount;          
        res.render('user/wishList', {admin:false,products,user,cartCount,userHeader:true,wishlistCount})                       
    },  
    

    // wishListDetails: async(req,res) => {
    //     let cartCount=0;
    //     let wishlistCount=0;
    //     if(req.session.loggedIn) {
    //         let user=req.session.user;
    //         let product = await userHelpers.cartDetails(req.session.user._id)
    //         let wishlist = await userHelpers.wishListDetails(req.session.user._id)
    //         try {
    //             cartCount = product.length;
    //             wishlistCount = wishlist.length;
    //         }catch(err) {
    //             console.log(err);
    //         }finally {
    //             if(cartCount>0 && wishlistCount>0) {
    //                 userHelpers.wishListDetails(req.session.user._id).then((products) => {
    //                     res.render('user/wishList', {admin:false,products,user,cartCount,userHeader:true,wishlistCount})
    //                 }) 
    //             }else{
    //                 userHelpers.wishListDetails(req.session.user._id).then((products) => {
    //                     res.render('user/wishList', {admin:false,products,user,cartCount,userHeader:true,wishlistCount})
    //                 }) 
    //             }                         
    //         }
    //     }else{
    //         res.redirect('/login')
    //     }         
    // },
    // wishListDetails: async(req,res) => {
    //     let count=0;
    //     let wishlistCount=0;
    //     if(req.session.loggedIn) {
    //         let user=req.session.user;
    //         let product = await userHelpers.cartDetails(req.session.user._id)
    //         let wishlist = await userHelpers.wishListDetails(req.session.user._id)
    //         try {
    //             count = product.length;
    //             wishlistCount = wishlist.length;
    //         }catch(err) {
    //             console.log(err);
    //         }finally {
    //             if(count>0 && wishlistCount>0) {
    //                 userHelpers.wishListDetails(req.session.user._id).then((products) => {
    //                     res.render('user/wishList', {admin:false,products,user,count,userHeader:true,wishlistCount})
    //                 }) 
    //             }else{
    //                 userHelpers.wishListDetails(req.session.user._id).then((products) => {
    //                     res.render('user/wishList', {admin:false,products,user,count,userHeader:true,wishlistCount})
    //                 }) 
    //             }                         
    //         }
    //     }else{
    //         res.redirect('/login')
    //     }         
    // },

    // sendOtp: (req, res)=>{       
    //     req.session.mobile = req.body.phone;
    //     userHelpers.checkForUser(req.body.phone).then(async (user) =>{
    //      if(user){
    //          req.session.user = user;
    //          await twilioApi.sendOtp(req.body.phone);
    //          res.json(true)
    //      }else{  
    //          req.session.user = null;
    //          req.session.otpLoginErr = "The phone number is not registerd with any account";
    //          res.json(false);
    //      }
        
    //     })
    //  }
    // wishListDetails: async(req,res) => {
    //     if(req.session.loggedIn) {
    //         let user=req.session.user;
    //         let product = await userHelpers.cartDetails(req.session.user._id)
    //         let count = product.length;
    //         userHelpers.wishListDetails(req.session.user._id).then((products) => {
    //             // console.log(response);
    //             res.render('user/wishList',{admin:false,user,count,products,userHeader:true })
    //         });
    //     }else{
    //         res.redirect('/login');
    //     }
    // },
    // addToWishlist : (req, res)=>{
    //     if(req.session.loggedIn){
    //         let productId = req.query.productId;
    //         let userId = req.session.user._id;
    //         let wishQuantity=1;
    //         try {
    //             if(parseInt(req.quantity)>1) {
    //                 console.log("already added to wishlist");
    //             }
    //         }catch(err) {
    //             console.log(err);
    //         }finally {
    //             userHelpers.addToWishlist(userId, productId,wishQuantity).then(()=> {
    //                 res.json={
    //                     success: true
    //                 }
    //             })
    //         }            
    //     }else{
    //             res.redirect('/login');
    //     }        
    // },

    // addToWishlist : (req, res)=>{
    //     if(req.session.loggedIn){
    //         let productId = req.query.productId;
    //         let userId = req.session.user._id;
    //         userHelpers.addToWishlist(userId, productId).then((response)=>{
    //             console.log(response)
    //         })
    //     }else{
    //         res.redirect('/login');
    //     }
    // },
    // addToWishlist : (req, res)=>{
    //     if(req.session.loggedIn){
    //         let productId = req.params.id;
    //         let userId = req.session.user._id;
            
    //         userHelpers.addToWishlist(userId, productId).then((response)=>{
    //             console.log(response);
    //             res.json({
    //                 message: "guest",
    //                 success: true
    //             })
    //         })
    //     }else{
    //         res.redirect('/login');
    //     }
    // },
    addToWishlist : (req, res)=>{
        if(req.session.loggedIn){
            let productId = req.params.id;
            let userId = req.session.user._id;
            let quantity = 1;
            try{
                if(parseInt(req.quantity)>1){
                    quantity=req.quantity
                }
                }catch(err){
                    console.log(err);
                }finally{
                    userHelpers.addToWishlist(userId, productId).then((response)=>{
                        console.log(response);
                        res.json({
                            message: "guest",
                            success: true
                        })
                    });
                }
                console.log("wishQuantity",quantity)                        
        }else{
            res.redirect('/login');
            }
        },

    // addToWishlist: (req, res) => {
    //     if (req.session.loggedIn) {
    //       const productId = req.params.id;
    //       const userId = req.session.user._id;
    //       let quantity = 1;
      
    //       try {
    //         if (parseInt(req.quantity) > 1) {
    //           quantity = req.quantity;
    //         }
    //       } catch (err) {
    //         console.log(err);
    //       } finally {
    //         userHelpers.addToWishlist(userId, productId).then((response) => {
    //           console.log(response);
      
    //           // Update wishlist count
    //           const wishlistCountEl = document.querySelector('#wishlist-count');
    //           const wishlistCount = parseInt(wishlistCountEl.innerHTML);
    //           wishlistCountEl.innerHTML = wishlistCount + 1;
      
    //           res.json({
    //             message: "guest",
    //             success: true,
    //           });
    //         });
    //       }
      
    //       console.log("wishQuantity", quantity);
    //     } else {
    //       res.redirect("/login");
    //     }
    //   },
      
    
    removeWishlistProduct: (req,res) => {
        console.log("ttttttttttttttt",req.params.id);
        const proId = req.params.id;
        console.log("ttttttttttttttt",req.params.id);
        const userId = req.session.user._id;
        userHelpers.removeWishlistProduct(userId, proId).then(() => {
            console.log('calledddddddddddddddddddddddddddddddd');
            res.json({status: true})
            // res.redirect('/wishList')
        })
    },

    // removeProduct: (req,res) => {
    //     const proId = req.params.id;
    //     const userId = req.session.user._id;
    //     userHelpers.removeProduct(userId, proId).then(() => {
    //         res.json({status: true})
    //     })
    // },

    BannerList :  (req, res)=>{
        let banner =  adminController.listBanner();


    },
    getPlaceOrder: async(req,res) => {
        if(req.session.loggedIn) {
            let user = req.session.user;
            // let products= await userHelpers.getCartProductList(req.body.userId)   //start from here
            let total = await userHelpers.get1TotalAmount(req.session.user._id);
            res.render('user/placeOrder',{admin:false,user,total, userHeader:true})
        }else{
            res.render('/login')
        }
    },
    postPlaceOrder: async(req,res) => {
        let products= await userHelpers.getCartProductList(req.body.userId)
        let totalPrice = await userHelpers.get1TotalAmount(req.body.userId)
        userHelpers.placeOrder(req.body,products,totalPrice).then((orderId) => {
            console.log(orderId);
            if(req.body['payment-method'] === 'COD') {
                res.json({ codSuccess: true})
            }else{
                userHelpers.generateRazorpay(orderId,totalPrice).then((response) => {
                    res.json(response)
                })
            }
        })
        console.log(req.body);
    },
    orderSuccess: (req,res) => {
        res.render('user/orderSuccess', {user:req.session.user})
    },
    userProfile: async(req,res) => {
        if(req.session.loggedIn) {
            let userDetails = req.session.user;
            let user = await userHelpers.findUser(userDetails._id)
            res.render('user/userProfile', {admin:false,user,userHeader:true})
        }else{
            res.redirect('/login')
        }
    },
    editProfileInfo: (req, res) => {
        console.log(req.body)
        try {
            userHelpers.updateProfileInfo(req.params.id,req.body)
            .then((response) => {
                console.log(response)
                res.redirect('/userProfile')
                // res.render('user/userProfile' , {admin:false,user,userHeader:true});
            })
        } catch(err) {
            console.log(err);
            res.redirect('/userProfile')
        }
    },
    getAddress: (req,res) => {
        if(req.session.user) {
            let user = req.session.user;
            res.render('user/manageAddress', {admin:false,user,userHeader:true})
        }else{
            res.redirect('/');
        }
    },
    addAddressPost: async(req,res) => {
        console.log(req.params.id);
        console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
        userHelpers.updateAddress(req.body,req.params.id);
        let user = await userHelpers.findUser(req.params.id);
        req.session.user = user;
        res.redirect('/manageAddress');
    },
    // applyCoupon : async(req,res) => {
    //     if(req.session.loggedIn) {
    //         let code = req.body.code;
    //         userHelpers.applyCoupon(code)

    //     }
    // },
    // postPlaceOrder: async(req,res) => {
    //     let products= await userHelpers.getCartProductList(req.body.userId)
    //     let totalPrice = await userHelpers.get1TotalAmount(req.body.userId)
    //     userHelpers.placeOrder(req.body,products,totalPrice).then((orderId) => {
    //         console.log(orderId);
    //         if(req.body['payment-method'] === 'COD') {
    //             res.json({ codSuccess: true})
    //         }
    //     })
    //     console.log(req.body);
    // }
    // addCategoryPost: async (req, res) => {
    //     console.log("ttttttttttttttttttt", req.body);
    //     let name = req.body.name;
    //     console.log(name);
      
    //     const categoryNameExist = await adminHelpers.isCategoryNameExist(name);
    //     if (categoryNameExist) {
    //       console.log("categoryNameExist", categoryNameExist);
    //       console.log("exist");
    //       let message = "Category already exists";
    //       res.redirect(`/admin/category?message=${message}`);
    //     } else {
    //       await adminHelpers.addCategory(req.body).then((response) => {
    //         res.redirect('/admin/category');
    //       });
    //     }
    //   }
    // applyCoupon: (code,subtotal) => {
    //     const coupon = db.coupons.findOne({ code: code })
    //     if (!coupon) {
    //         return { success: false, message: 'Invalid coupon code' }
    //     }
    //     if (coupon.valid_until < new Date()) {
    //         return { success: false, message: 'Coupon code has expired' }
    //     }
    //     const discount = coupon.discount
    //     const total = subtotal - discount
    //     return { success: true, message: 'Coupon code applied', total: total }
    //     } 
      
    viewOrders: async(req,res) => {
        let user =req.session.user;
        const userId = req.session.user._id;
        let cartCount = req.session.cartCount;
        let wishlistCount = req.session.wishlistCount;
        let orders = await userHelpers.getUserOrders(userId)   
            orders.forEach(order => {
                order.isCancelled = order.status === "cancelled"?true:false;
                order.isDelivered = order.status === "delivered"?true:false;
                date = new Date()
            }) 
        res.render('user/viewOrders', {admin:false, user, cartCount, wishlistCount, userHeader:true,orders})
    },
   

    // viewOrders: async(req,res) => {
    //     if(req.session.loggedIn) {
    //         const user = req.session.user;
    //         const userId = req.session.user._id;
    //         let orders = await userHelpers.getUserOrders(userId)   
    //         orders.forEach(order => {
    //             order.isCancelled = order.status === "cancelled"?true:false;
    //             order.isDelivered = order.status === "delivered"?true:false;
    //             date = new Date()
    //         })         
    //         res.render('user/viewOrders', {admin:false,user,userHeader:true,orders})            
    //     }else{
    //         res.redirect('/login')
    //     }
    // },

    singleOrderDetailUser: async(req,res) => {
        if(req.session.loggedIn) {
            let user = req.session.user;
            let orderId = req.params.id;
            let products = await productHelpers.getOrderedProducts(req.params.id);
            userHelpers.singleOrderView(orderId).then((deliveryDetails) => {
                res.render('user/singleOrderDetailUser', {admin:false,user,userHeader:true,orderId,products, deliveryDetails})
            });
        }else{
            res.redirect('/login')
        }
    },
    cancelOrder:(req,res) =>{
        const orderId = req.params.id;
        console.log("api call from cancel order !!!")
        userHelpers.cancelOrder(orderId).then(() => {
            res.redirect('/viewOrders');
        })
    },
    verifyPayment: (req,res) => {
        console.log(req.body);
        userHelpers.verifyPayment(req.body).then(() => {
            userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
                console.log("Payment Successfull");
                res.json({ status: true })
            })
        }).catch((err) => {
            console.log(err);
            res.json({ status: false, errMsg:'' })
        })
    }
}

