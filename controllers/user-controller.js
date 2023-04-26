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
const { ObjectId } = require('mongodb');
let userHeader;

module.exports={
    get:async(req,res)=>{        
        let cartCount = 0;
        let wishlistCount = 0;
        let banner = await adminController.getAllBanners();
        if(req.session.loggedIn){
            let user=req.session.user;
            cartCount = await userHelpers.getCartCountNew(req.session.user._id);
            console.log("cartCounttttttttttttt", cartCount);
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
    // userSignupPost:(req,res)=>{
    //     userHelpers.doSignUp(req.body).then((response)=>{
    //         req.session.loggedIn=true;
    //         req.session.user=response;
    //         console.log(req.session.user);
    //         res.render('user/login')
    //     })
    // },
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
    
    shop: async(req,res)=>{        
        try {
            let cartCount = 0;
            let wishlistCount = 0;
            let filter = req.query.filter;
            console.log(filter, "hiin akhilaa");
            let currentPage = req.query.page || 1 ;
            let totalCount = await userHelpers.getProductCount()
            // Check if the user is logged in
            if(req.session.loggedIn){
                let user=req.session.user;
                // let currentPage = req.query.page || 1 ;
                // Get the number of items in the cart and wishlist for the user
                cartCount = await userHelpers.getCartCountNew(req.session.user._id);
                req.session.cartCount = parseInt(cartCount);
                wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
                req.session.wishlistCount = parseInt(wishlistCount);
                // If there is a filter, get the filtered products and render the shop page
                if(filter) {
                    adminHelpers.getAllCategories().then(async(category) => {
                        var products= await productHelpers.getFilteredPro(filter);
                        res.render('user/shop',{admin:false,user,cartCount,category, wishlistCount, totalCount, userHeader:true,products});
                        console.log(products);                       
                    })
                }else{
                    // Otherwise, get all products and render the shop page
                    adminHelpers.getAllCategories().then((category) => {
                        productHelpers.viewProducts(currentPage).then((products)=>{
                            res.render('user/shop',{admin:false,user,cartCount,category,currentPage,totalCount, wishlistCount, userHeader:true,products});
                            console.log(products);
                        })
                    })
                }                    
            }else{
                // If the user is not logged in
                if(filter) {
                    adminHelpers.getAllCategories().then(async(category) => {
                        var products=await productHelpers.getFilteredPro(filter);
                        res.render('user/shop',{admin:false,cartCount,category, wishlistCount, userHeader:true,products});
                        console.log(products);                       
                    })
                }else{
                    adminHelpers.getAllCategories().then((category) => {
                        productHelpers.viewProducts(currentPage).then((products)=>{
                            res.render('user/shop',{admin:false, products,currentPage, totalCount, cartCount, category, wishlistCount, userHeader:true});
                            console.log(products);
                        })
                    })
                }                          
            }
        } catch(err) {
            console.log(err);
        }       
    },

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
                userHelpers.addToCart(userId,productId,quantity).then(async(response) => {
                    const cartCount = await userHelpers.getCartCountNew(userId);
                    console.log(response);
                    res.json({
                        message: "guest",
                        success: true,
                        cartCount: cartCount
                    })
                });
            }
            // console.log(quantity)
            
        }else{
            res.redirect('/login');
        }
    },
    cartDetails: async(req,res) => {
        let user =req.session.user;
        let product = await userHelpers.cartDetails(req.session.user._id)
        let totalAmount = await userHelpers.get1TotalAmount(req.session.user._id);
        let cartCount = req.session.cartCount;
        console.log(`carrt count ::::: ${cartCount}`);
        let wishlistCount = req.session.wishlistCount;
        
        res.render('user/cart', {product,cartCount,wishlistCount,totalAmount,user, userHeader:true, errCheckOut:req.session.checkOutErr })
        req.session.checkOutErr=false
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
            console.log("counttttttttttttttttttttttttttttttttt",count);
            if(count!=0){
                response.total=await userHelpers.get1TotalAmount(userId)
                console.log(response.total);
            }
            res.json(response)
        })
    },

    removeProduct: (req,res) => {
        console.log("tttttttttttttttttttttttttt",req.params.id);
        const proId = req.params.id;
        const userId = req.session.user._id;
        userHelpers.removeProduct(userId, proId).then(() => {
            res.json({status: true})
        })
    },
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
        let user=req.session.user;
        let products = await userHelpers.wishListDetails(req.session.user._id)
        let wishlistCount = req.session.wishlistCount;               
        let cartCount = req.session.cartCount;          
        res.render('user/wishList', {admin:false,products,user,cartCount,userHeader:true,wishlistCount})                       
    },  
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
                    userHelpers.addToWishlist(userId, productId).then(async(response)=>{
                        wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
                        console.log(response);
                        res.json({
                            message: "guest",
                            success: true,
                            wishlistCount: wishlistCount
                        })
                    });
                }
                console.log("wishQuantity",quantity)                        
        }else{
            res.redirect('/login');
            }
        },
        // addToCart: (req,res) => {
        //     if(req.session.loggedIn) {
        //         console.log("hello")
        //         let productId = req.params.id;
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
        //             userHelpers.addToCart(userId,productId,quantity).then((response) => {
        //                 console.log(response);
        //                 res.json({
        //                     message: "guest",
        //                     success: true
        //                 })
        //             });
        //         }
        //         // console.log(quantity)
                
        //     }else{
        //         res.redirect('/login');
        //     }
        // }
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
    // getPlaceOrder: async(req,res) => {
    //     let user = req.session.user;
    //     let total = await userHelpers.get1TotalAmount(req.session.user._id);    
    //     let wishlistCount = req.session.wishlistCount;
    //     console.log("uuuuuuuuuuuuuuuuuuuuuu", user);
    //     res.render('user/placeOrder',{admin:false,user,total,wishlistCount, userHeader:true})
    // },
    getPlaceOrder: async(req,res) => {
        let user = req.session.user;
        let userId = req.session.user._id;
        let outOfStock = false;
        let total = await userHelpers.get1TotalAmount(req.session.user._id);    
        let wishlistCount = req.session.wishlistCount;
        let products = await userHelpers.cartDetailsPlaceOrder(req.session.user._id)
        console.log("uuuuuuuuuuuuuuuuuuuuuu", products);
        const totalAmount = await db.get().collection(collection.WALLET_COLLECTION).aggregate(
            [
                { 
                    $match: { 
                        userId: new ObjectId(userId) 
                    } 
                },
                { $group: { 
                    _id: null, 
                    total: { $sum: '$amount' } 
                    } 
                }
            ]).toArray().then(data => data.length ? data[0].total : 0);
        for(let i=0;i<products.length;i++){
            if(products[i].proDetails.stock===0){
                outOfStock=true;
            }
        }
        if(outOfStock) {
            console.log("out of stockkkkkkkkkkkkkkkkkkkkkkkkkk");
            req.session.checkOutErr = "Product is out of stock";
            res.redirect('/cart')
        }else{
            res.render('user/placeOrder',{admin:false,user,total,wishlistCount,products, userHeader:true, totalAmount})
        }
       
    },
    // postPlaceOrder: async(req,res) => {
    //     // console.log(req.body)
    //     req.body.userId = req.session.user._id;
    //     const address = await userHelpers.findAddr(req.body.userId, req.body.addrDetails);
    //     let products= await userHelpers.getCartProductList(req.body.userId)
    //     let totalPrice = await userHelpers.get1TotalAmount(req.body.userId)
    //     req.body.address = address;
    //     userHelpers.placeOrder(req.body,products,totalPrice).then((orderId) => {
    //         console.log(orderId);
    //         if(req.body['payment-method'] === 'COD') {
    //             res.json({ codSuccess: true})
    //         }else{
    //             userHelpers.generateRazorpay(orderId,totalPrice).then((response) => {
    //                 res.json(response)
    //             })
    //         }
    //     })
    //     console.log(req.body);
    // },
    // postPlaceOrder: async(req,res) => {
    //     console.log("toal%^&*()(*&^%^&*()(*&^%^&*()somethiogn", req.body)
    //     req.body.userId = req.session.user._id;
    //     req.body.userName = req.session.user;
    //     const address = await userHelpers.findAddr(req.body.userId, req.body.addrDetails);
    //     let products= await userHelpers.getCartProductList(req.body.userId);
    //     // let totalPrice = await userHelpers.get1TotalAmount(req.body.userId);
    //     let totalPrice = req.body.totalAmount;
    //     req.body.address = address;
    //     userHelpers.placeOrder(req.body,products,totalPrice).then((orderId) => {
    //         console.log(orderId);
    //         if(req.body['payment-method'] === 'COD') {
    //             res.json({ codSuccess: true})
    //         }else{
    //             userHelpers.generateRazorpay(orderId,totalPrice).then((response) => {
    //                 res.json(response)
    //             })
    //         }
    //     })
    //     console.log(req.body);
    // },
    // postPlaceOrder: async(req,res) => {
    //     console.log("toal%^&*()(*&^%^&*()(*&^%^&*()somethiogn", req.body)
    //     req.body.userId = req.session.user._id;
    //     req.body.userName = req.session.user;
    //     const address = await userHelpers.findAddr(req.body.userId, req.body.addrDetails);
    //     let products= await userHelpers.getCartProductList(req.body.userId);
    //     // let totalPrice = await userHelpers.get1TotalAmount(req.body.userId);
    //     let totalPrice = req.body.totalAmount;
    //     req.body.address = address;
    //     //const cart= cart.products;
    //     userHelpers.placeOrder(req.body,products,totalPrice).then((orderId) => {
    //         console.log(orderId);
    //         if(req.body['payment-method'] === 'COD') {
    //             productHelpers.decreamentStock(products).then(() => {}).catch(() =>{});
    //             res.json({ codSuccess: true})
    //         }else{
    //             userHelpers.generateRazorpay(orderId,totalPrice).then((response) => {
    //                 productHelpers.decreamentStock(products).then(() => {}).catch(() =>{});
    //                 res.json(response)
    //             })
    //         }
    //     })
    //     console.log(req.body);
    // },
    postPlaceOrder: async(req,res) => {
        console.log("toal%^&*()(*&^%^&*()(*&^%^&*()somethiogn", req.body)
        req.body.userId = req.session.user._id;
        req.body.userName = req.session.user;
        const address = await userHelpers.findAddr(req.body.userId, req.body.addrDetails);
        let products= await userHelpers.getCartProductList(req.body.userId);
        // let totalPrice = await userHelpers.get1TotalAmount(req.body.userId);
        let totalPrice = Number(req.body.totalAmount);
        req.body.address = address;
        //const cart= cart.products;
        userHelpers.placeOrder(req.body,products,totalPrice).then(async(orderId) => {
            req.session.orderId= orderId;
            console.log(orderId);
            if(req.body['payment-method'] === 'COD') {
                productHelpers.decreamentStock(products).then(() => {}).catch(() =>{});
                res.json({ codSuccess: true})
            }else if(req.body['payment-method'] === 'wallet'){
                for(let i=0;i<products.length;i++){
                    productHelpers.decreamentStock(products).then(() => {}).catch((err) =>console.log(err));
                }
                await userHelpers.updateWallet(req.session.user._id,totalPrice)
                console.log("total priceeeeeeeeeeee", totalPrice);
                res.json({walletSuccess:true})
            }else{
                userHelpers.generateRazorpay(orderId,totalPrice).then((response) => {
                    productHelpers.decreamentStock(products).then(() => {}).catch((err) =>console.log(err));
                    res.json(response)
                })
            }
        })
        console.log(req.body);
    },
    // orderSuccess: (req,res) => {
        
    //     res.render('user/orderSuccess', {user:req.session.user})
    // },
    orderSuccess: async(req,res) => {
        try{
            // let user = req.session.user;
            // let cartCount = req.session.cartCount;
            // let wishlistCount = req.session.wishlistCount;
            let orderId = req.session.orderId;
            console.log("uuuuuuuuuuuuuuuuu", orderId);
            let orderDetails = await productHelpers.getOrderDetails(orderId);
            // const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            // let date = orderDetails.date.getDate() + "-" + months[orderDetails.date.getMonth()] + "-" + orderDetails.date.getFullYear()
            // res.render('user/orderSuccess', {user, cartCount, wishlistCount, orderDetails, userHeader:true})
            res.render('user/orderSuccess', {user:req.session.user, orderDetails})
        }catch(err){
            console.log(err);
            // res.redirect('/login')
        }
        
    },
   
    // getAddress: (req,res) => {
    //     let user = req.session.user;
    //     let cartCount = req.session.cartCount;
    //     let wishlistCount = req.session.wishlistCount;
    //     res.render('user/manageAddress', {admin:false,user, cartCount, wishlistCount, userHeader:true})
        
    // },
    // userProfile: async(req,res) => {
    //     if(req.session.loggedIn) {
    //         let userDetails = req.session.user;
    //         let user = await userHelpers.findUser(userDetails._id)
    //         res.render('user/userProfile', {admin:false,user,userHeader:true})
    //     }else{
    //         res.redirect('/login')
    //     }
    // },
    userProfile: async(req,res) => {
        let userDetails = req.session.user;
        let user = await userHelpers.findUser(userDetails._id);
        let cartCount = req.session.cartCount;
        let wishlistCount = req.session.wishlistCount;
        res.render('user/userProfile', {admin:false,user,cartCount,wishlistCount,userHeader:true})
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
    // getAddress: (req,res) => {
    //     if(req.session.user) {
    //         let user = req.session.user;
    //         res.render('user/manageAddress', {admin:false,user,userHeader:true})
    //     }else{
    //         res.redirect('/');
    //     }
    // },
    getAddress: (req,res) => {
        let user = req.session.user;
        let cartCount = req.session.cartCount;
        let wishlistCount = req.session.wishlistCount;
        res.render('user/manageAddress', {admin:false,user, cartCount, wishlistCount, userHeader:true})
        
    }, 
    addAddressPost: async(req,res) => {
        console.log(req.params.id);
        console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
        userHelpers.updateAddress(req.body,req.params.id);
        let user = await userHelpers.findUser(req.params.id);
        req.session.user = user;
        res.redirect('back');
    },
    removeProfileAddress: (req,res) => {
        console.log("req.params.idddddddddd", req.params.id);
        const addrId = req.params.id;
        const userId = req.session.user._id;
        userHelpers.removeProfileAddress(userId, addrId).then(() => {
            console.log("addresssssssssss");
            res.json({ status: true})
        })
    },
    
    // applyCoupon : async(req,res) => {
    //     if(req.session.loggedIn) {
    //         let code = req.body.code;
    //         userHelpers.applyCoupon(code)

    //     }
    // },
 
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
      

    viewOrders: async(req, res) => {
        let user = req.session.user;
        const userId = req.session.user._id;
        let cartCount = req.session.cartCount;
        let wishlistCount = req.session.wishlistCount;
        let orders = await userHelpers.getUserOrders(userId);
        orders.forEach(order => {
          order.isCancelled = order.status === "cancelled" ? true : false;
          order.isDelivered = order.status === "delivered" ? true : false;
          order.isReturned = order.status === 'returned' ? true : false;
      
          const months = ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC"];
          const dateObj = new Date(order.date);
          const day = dateObj.getDate().toString().padStart(2, "0");
          const month = months[dateObj.getMonth()];
          const year = dateObj.getFullYear();
          order.date = `${day}-${month}-${year}`;
        });
      
        res.render('user/viewOrders', { admin: false, user, cartCount, wishlistCount, userHeader: true, orders });
      },
    singleOrderDetailUser: async(req,res) => {
        let user = req.session.user;
        let cartCount = req.session.cartCount;
        let wishlistCount = req.session.wishlistCount;
        let orderId = req.params.id;
        let products = await productHelpers.getOrderedProducts(req.params.id);
        userHelpers.singleOrderView(orderId).then((deliveryDetails) => {
            console.log("yyyyyyyyyyyyyyyyyyyy",deliveryDetails);
            res.render('user/singleOrderDetailUser', {admin:false,user,userHeader:true,orderId,products, deliveryDetails,cartCount,wishlistCount});
            if(products.length===0){
                res.render('user/cartSvg', {admin:false,user,userHeader:true,products, deliveryDetails,cartCount,wishlistCount})
            }
        });
    },
    cancelOrder:(req,res) =>{
        const orderId = req.params.id;
        console.log("api call from cancel order !!!")
        userHelpers.cancelOrder(orderId).then(() => {
            res.redirect('/viewOrders');
        })
    },
    // returnOrder: async(req,res) =>{
    //     const orderId = req.params.id;
    //     userHelpers.returnOrder(orderId).then(() => {
    //         res.redirect('/viewOrders');
    //     })
    // },
    returnOrder: async(req,res) =>{
        const orderId = req.params.id;
        let userId = req.session.user._id;
        const totalAmount = await userHelpers.orderTotalCost(orderId);
        userHelpers.returnOrder(orderId).then(() => {
            userHelpers.toWallet(userId, "returned", totalAmount[0].total).then(() => {
                res.redirect('/viewOrders');
            })
        })
        .catch(() => {
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
    },
    getForgotPassword: (req,res) => {
        res.render('user/forgotPassword', {loginErr:req.session.loginErr});
        req.session.loginErr=false;
    },
    forgotPasswordOtp:(req,res) => {
        req.session.mobile = req.body.phone;
       userHelpers.checkForUser(req.body.phone).then(async (user) =>{
        if(user){
            req.session.user = user;
            await twilioApi.sendOtpForForgotPass(req.body.phone);
            // res.json(true)
            res.render('user/forgotSetNewPassword', {admin:false,user,userHeader:true})
        }else{  
            req.session.user = null;
            req.session.loginErr = "The phone number is not registerd with any account";
            res.json(false);
        }
       
       })

    },
    forgotPasswordVerify:(req,res) => {
        twilioApi.verifyOtpForForgotPass(req.session.mobile, req.body.otp).then((result) =>{
            if(result === "approved"){
                req.session.loggedIn=true;
                res.json({status : true}) 

            }
            else{               
                res.json({status : false})
            }
        })
    },
    newPasswordUpdate: (req,res) => {
        res.render('user/forgotSetNewPassword', {admin:false,userHeader:true})
    },
    newPasswordUpdatePost: async(req,res) => {
        password = await userHelpers.newPasswordUpdate(req.session.user._id,req.body);
        req.session.destroy();
        res.redirect('/login');
    },
    search: async(req, res) => {        
        const searchValue = req.query.search;
        let cartCount = 0;
        let wishlistCount = 0;
        if(req.session.loggedIn) {
            let user=req.session.user;
            cartCount = await userHelpers.getCartCountNew(req.session.user._id);
            req.session.cartCount = parseInt(cartCount);
            wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
            req.session.wishlistCount = parseInt(wishlistCount);
            productHelpers.search({ search: searchValue }).then((products) => {
                if (products.length > 0) {
                  res.render('user/shop', {admin:false,userHeader:true,products,user,cartCount,wishlistCount})
                } else {
                //   res.json({
                //     status: 'error',
                //     message: 'No matching products found'
                //   });
                // }
                res.render('user/searchEmpty', {admin:false,userHeader:true,products,user,cartCount,wishlistCount})
                }
              }).catch((err) => {
                res.json({
                  status: 'error',
                  message: err.message
                });
              });
        }else{
            productHelpers.search({ search: searchValue }).then((products) => {
                if (products.length > 0) {
                  res.render('user/shop', {admin:false,userHeader:true,products,cartCount,wishlistCount})
                } else {
                  res.json({
                    status: 'error',
                    message: 'No matching products found'
                  });
                }
              }).catch((err) => {
                res.json({
                  status: 'error',
                  message: err.message
                });
              });
        }        
    },
    couponApply: (req,res) => {
        const userId = req.session.user._id;
        console.log("api call 4567890987654567890-0987654");
        userHelpers.couponApply(req.body.couponCode, userId).then((coupon) => {
            console.log(coupon)
            if(coupon) {
                if(coupon === "couponExist") {
                    res.json({
                        status:"success",
                        message: "coupon is already used !!",
                        used: true,
                        coupon : coupon
                    })
                }else{
                    console.log("everything as planned")
                    res.json({
                        status:"success",
                        coupon:coupon,
                        total: coupon.discount
                    })
                }
            }else{
                res.json({
                    status: "coupon is not valid!"
                })
            }
        });
    },
    getWallet: async(req,res) => { 
        const userId = req.session.user._id;
        const user = await db.get().collection(collection.USER_COLLECTION)
        .findOne({ _id: new ObjectId(userId) });
        let cartCount = req.session.cartCount;
        let wishlistCount = req.session.wishlistCount;
        const orders = await db.get().collection(collection.ORDER_COLLECTION)
        .find({userId: new ObjectId(userId), status: 'pending', refunded: { $ne: true } }).toArray();

        orders.forEach(async (order) => {
            await db.get().collection(collection.WALLET_COLLECTION).insertOne({
              userId: new ObjectId(userId),
              source: 'online-payment-failed',
              amount: order.totalCost
            });
            await db.get().collection(collection.ORDER_COLLECTION).updateOne(
                { _id: order._id },
                { $set: { refunded: true } }
            );
        })

        const wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: new ObjectId(userId) });
        console.log("wallettttt", wallet);
        let userWallet = wallet.amount;
        // const totalAmount = await db.get().collection(collection.WALLET_COLLECTION).aggregate(
        //     [
        //         { 
        //             $match: { 
        //                 userId: new ObjectId(userId) 
        //             } 
        //         },
        //         { $group: { 
        //             _id: null, 
        //             total: { $sum: '$amount' } 
        //             } 
        //         }
        //     ]).toArray().then(data => data.length ? data[0].total : 0);

            res.render('user/wallet', { admin:false, user, cartCount, wishlistCount, wallet, userHeader:true, userWallet});
          
    } 
    // getWallet: async(req,res) => { 
    //     let user = req.session.user;
    //     const userId = req.session.user._id;
    //     let cartCount = req.session.cartCount;
    //     console.log("oooooooooooooooo", cartCount);
    //     console.log("oooooooooooooooo", user);
    //     let wishlistCount = req.session.wishlistCount;
    //     const orders = await userHelpers.getOrders(userId);
        
    //     orders.forEach(order => {
    //         if(order.status === 'pending' && !order.refunded){
    //             userHelpers.toWallet(userId, "online-payment-failed", order.totalCost)
    //             .then(() => {}).catch(() => {});
    //         }
    //     });
    //     const wallet = await userHelpers.getWallet(userId);
    //     const totalAmount = await userHelpers.totalWalletAmount(userId);
    //     if(wallet) {
    //         console.log("wallettttttttttt", wallet);
    //         res.render('user/wallet', {admin:false, user, cartCount, wishlistCount, totalAmount, wallet, userHeader:true})     
    //     }else{
    //         res.render('user/wallet', {admin:false, user, cartCount, wishlistCount, userHeader:true})     
    //     }
          
    // }   
}

