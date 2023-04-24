const db=require('../config/connection');
const collection=require('../config/collections');
const bcrypt=require('bcrypt');
const adminHelpers=require('../helpers/admin-helpers');
const userHelpers=require('../helpers/user-helpers');
// const { response } = require('express');
const { LogInstance } = require('twilio/lib/rest/serverless/v1/service/environment/log');
const productHelpers = require('../helpers/product-helpers');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const { ObjectId } = require('mongodb');
const async = require('hbs/lib/async');
const file = require('fileupload/lib/modules/file');
const { response } = require('express');
const { log } = require('handlebars/runtime');
// const { reject } = require('bcrypt/promises');
// const async = require('hbs/lib/async');
let adminHeader;

module.exports ={
    // get:(req,res)=>{
    //     let admin=req.session.admin;
    //     res.render("admin/admin-login"),{admin,adminHeader:true}
    // },
    adminLogin:(req,res)=>{
        if(req.session.adminLoggedIn){
        res.redirect('/admin/dashboard')
        }else{
            let admin=req.session.admin;
            req.session.adminLoginErr=false
            res.render('admin/admin-login', {adminLoginErr:req.session.adminLoginErr,admin,adminHeader:true});
            
        }
    },
    // adminLoginPost:(req,res)=>{
    //     // console.log("arrived");
    //     console.log(req.body)
    //     adminHelpers.adminLogin(req.body).then((response)=>{
    //         console.log(response)
    //         if(response.status){
    //             req.session.adminName=response.admin.adminName;
    //             req.session.admin = response.admin;
    //             let admin = req.session.admin
    //             req.session.adminEmail=req.body.email;
    //             req.session.adminLoggedIn=true;
    //             res.redirect('/admin/dashboard', {admin, adminHeader:true, adminName:req.session.adminName});
    //         }else{
    //             req.session.adminLoginErr="Invalid username or password"
    //             res.redirect('/admin');
    //         }
    //     })
    // },
    adminLoginPost:(req,res)=>{
        // console.log("arrived");
        console.log(req.body)
        adminHelpers.adminLogin(req.body).then((response)=>{
            console.log(response)
            if(response.status){
                req.session.adminName=response.admin.adminName;
                req.session.admin = response.admin;
                let admin = req.session.admin
                req.session.adminEmail=req.body.email;
                req.session.adminLoggedIn=true;
                res.redirect('/admin');
            }else{
                req.session.adminLoginErr="Invalid username or password"
                res.redirect('/admin');
            }
        })
    },
    // dashBoard:(req,res)=>{
    //     if(req.session.adminLoggedIn){
    //         console.log(req.session.adminName);
    //         res.render('admin/dashboard', {admin:true,adminHeader:true, adminName:req.session.adminName});
    //     }else{
    //         res.redirect('/admin/admin-login');
    //     }
    // },
    dashBoard:(req,res)=>{
        adminHelpers.getUsersCount().then(async(usersCount) => {
            const total = await adminHelpers.getLastMonthTotal();
            const totalOrdersDelivered = await productHelpers.totalOrdersDelivered();
            let totalEarnings = 0;
            totalEarnings = await adminHelpers.getOrderTotalPrice();
            console.log(req.session.adminName);
            console.log("kkkkkkkkkkkkkkkkkkkkkkkkk87634567889", total);
            console.log("iufdfghjkljhgfdghooooooooooo", usersCount);
            console.log("iufdfghjkljhgfdghooooooooooo", total);
            console.log("iufdfghjkljhgfdghooooooooooo", totalOrdersDelivered);
            console.log("iufdfghjkljhgfdghooooooooooo", totalEarnings);
            res.render('admin/dashboard', {admin:true,adminHeader:true, usersCount, total, totalOrdersDelivered, totalEarnings, adminName:req.session.adminName});
        }).catch(() => {
            res.render('admin/dashboard', {admin:true,adminHeader:true, usersCount, total, totalOrdersDelivered, totalEarnings, adminName:req.session.adminName});
        })    
    },
    // dashBoard:(req,res)=>{
    //     console.log(req.session.adminName);
    //         res.render('admin/dashboard', {admin:true,adminHeader:true, adminName:req.session.adminName});
    // },
    adminLogout:(req,res)=>{
        // req.session.destroy();
        req.session.adminLoggedIn=false;
        res.redirect('/admin')
    },
    userManage:(req,res)=>{
        adminHelpers.getUsers().then((user)=>{
            res.render('admin/user-management',{user,admin:true,adminName:req.session.adminName})
        })
    },
    blockUser:(req,res)=>{
        let userId=req.params.id;
        console.log(userId);
        adminHelpers.blockUser(userId).then((response)=>{
            res.redirect('/admin/user-management')
        })
    },
    unblockUser:(req,res)=>{
        let userId=req.params.id;
        console.log(userId);
        adminHelpers.unblockUser(userId).then((response)=>{
            res.redirect('/admin/user-management');
        })
    },
    // viewProducts:(req,res)=>{
    //     if(req.session.adminLoggedIn){
    //         productHelpers.viewProducts().then((products)=>{
    //             console.log(products);
    //             res.render('admin/view-products',{admin:true, products,adminName:req.session.adminName});
    //         })
    //     }else{
    //         res.redirect('/admin/admin-login')
    //     }
    // },
    viewProducts:(req,res)=>{
        productHelpers.viewProducts().then((products)=>{
            console.log(products);
            res.render('admin/view-products',{admin:true, products,adminName:req.session.adminName});
        })
    },
    // addProductGet: async(req,res)=>{
    //    if(req.session.adminLoggedIn){
    //     adminHelpers.allCategories().then((category) => {
    //         console.log("category: ",category);
    //         res.render('admin/add-product',{admin:true,category, adminName:req.session.adminName});
    //     })
    //    }        
    // },
    addProductGet: async(req,res)=>{
        adminHelpers.allCategories().then((category) => {
            console.log("category: ",category);
            res.render('admin/add-product',{admin:true,category, adminName:req.session.adminName});
        })       
     },
    addProductPost:async(req,res)=>{
        console.log("uuuuuuuuuuuuuu");
        try{
            console.log(req.files);      
                const imgUrl = [];
                for(let i=0;i<req.files.length;i++){
                    const result = await cloudinary.uploader.upload(req.files[i].path);
                    imgUrl.push(result.url);
                    console.log("result.urliiiiiiiiiiiiiiiii",result.url);
                }
                productHelpers.addProduct(req.body,async(id) => {
                    productHelpers.addProductImages(id,imgUrl).then((response) => {
                        console.log(response);
                    })
                })
        }catch(err){
            console.log(err);
        }finally{
            res.redirect('/admin/view-products');
        }
    },
    // bannerManagement:(req,res) => {       //1
    //     if(req.session.adminLoggedIn){
    //         adminHelpers.getBanners().then((banner) => {
    //             //console.log(banner);
    //             res.render('admin/bannerManagement', {admin:true,banner,adminName:req.session.adminName})
    //         })
    //     }else{
    //         res.redirect('/admin/admin-login')
    //     }
    // },
    bannerManagement:(req,res) => {       //1
        adminHelpers.getBanners().then((banner) => {
            res.render('admin/bannerManagement', {admin:true,banner,adminName:req.session.adminName})
        })
    },
    addBannerGet:(req,res) => {          //1
        res.render('admin/add-banner', {admin:true, adminName:req.session.adminName})
    },
    addBannerPost:async(req,res) => {           //1
        try {
            //console.log(req.files);
                adminHelpers.addBanner(req.body,async(id) => {
                    let result = await cloudinary.uploader.upload(req.file.path);
                    await adminHelpers.updateBannerImages(id,result.url);
                })
        }catch(err){
            console.log(err);
        }finally{
            res.redirect('back');
        }
    },
    listBanner:(req,res) => {             //1
        adminHelpers.bannerList(req.params.id).then(()=>{
            res.redirect('back');
        })
    },
    unlistBanner: (req,res) => {         //1
        console.log(req.params.id);
        adminHelpers.unListbanner(req.params.id).then(()=>{
            res.redirect('back');
        })
    },
    editBanner:async(req,res) => {     //1
        console.log("rtrrrrrrr", req.params.id);
        //adminHelpers.getBannerDetails(req.params.id);
        let banner =await adminHelpers.getBannerDetails(req.params.id).then();
        console.log("banner", banner);
        res.render('admin/edit-banner', {admin:true, adminName:req.session.adminName,banner})
    },
    editBannerPost: async (req,res) => {     //1
        console.log("00000000000000", req.body);
        try{
            await adminHelpers.updateBanner(req.param.id, req.body);
            let result = await cloudinary.uploader.upload(req.file.path);
            if(result.url) {
                await adminHelpers.updateBannerImages(req.params.id, result.url);
            }
        }catch(err){
            console.log("error", err);
        }finally{
            res.redirect('/admin/bannerManagement');
        }
    },
    // editBannerPost: async (req,res) => {     //1
    //     console.log("555555555555555555",req.body);
    //     try{
    //         //adminHelpers.updateBanner(req.param.id, req.body);
    //         let imgUrl=[];
    //         for(let i=0;i<req.files.length;i++){
    //             let result = await cloudinary.uploader.upload(req.file.path);
    //             imgUrl.push(result.url);
    //         }
    //         if(imgUrl.length!==0){
    //             adminHelpers.updateBannerImages(req.param.id, imgUrl)
    //         }
    //         adminHelpers.updateBanner(req.param.id, req.body);
    //     }catch(err){
    //         console.log("error", err);
    //     }finally{
    //         res.redirect('/admin/bannerManagement');
    //     }
    // },
    // editProductPost: async(req,res) => {     
    //     try {
    //         let imgUrls = []
    //         for(let i=0;i<req.files.length;i++){
    //             let result = await cloudinary.uploader.upload(req.files[i].path);
    //             imgUrls.push(result.url);
    //         }
    //         if(imgUrls.length!==0){
    //             productHelpers.updateProductImages(req.params.id, imgUrls)
    //         }
    //         productHelpers.updateProduct(req.params.id,req.body)
    //     }catch(err){
    //         console.log(err);
    //     }finally{
    //         res.redirect('/admin/view-products');
    //     }       
    // }
    
    getBannerDetails: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .findOne({_id: new ObjectId(bannerId)})
            .then((response) => {
                resolve(response);
            })
        })
    }, 
    
    getAllBanners: () => {
        return new Promise(async(resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION)
            .find().toArray();
            resolve(banners);
        })
    },
    deleteBanner: (req,res) => {
        const bannerId = req.params.id;
        adminHelpers.deleteBanner(bannerId).then(() => {
            res.redirect('back');
        })
    },
    addCategoryPost: async (req, res) => {
        console.log("ttttttttttttttttttt", req.body);
        let name = req.body.name;
        console.log(name);
      
        const categoryNameExist = await adminHelpers.isCategoryNameExist(name);
        if (categoryNameExist) {
          console.log("categoryNameExist", categoryNameExist);
          console.log("exist");
          let message = "Category already exists";
          res.redirect(`/admin/category?message=${message}`);
        } else {
          await adminHelpers.addCategory(req.body).then((response) => {
            res.redirect('/admin/category');
          });
        }
      },      
    //   categoryManagement: (req, res) => {
    //     if (req.session.adminLoggedIn) {
    //       const message = req.query.message;
    //       console.log("message", message);
    //       adminHelpers.allCategories().then((category) => {
    //         res.render("admin/category", {admin: true,adminName: req.session.adminName,category,message});
    //       });
    //     } else {
    //       res.redirect("/admin/login");
    //     }
    //   },
    categoryManagement: (req, res) => {
        const message = req.query.message;
          console.log("message", message);
          adminHelpers.allCategories().then((category) => {
            res.render("admin/category", {admin: true,adminName: req.session.adminName,category,message});
          });
      },
    listcategory: (req,res) => {
        adminHelpers.categoryList(req.params.id).then(() => {
            res.redirect('back');
        })
    },
    unlistcategory: (req,res) => {
        adminHelpers.categoryUnlist(req.params.id).then(() => {
            res.redirect('back');
        })
    },

    editCategoryPost: (req,res) => {
        try {
            adminHelpers.updateCategory(req.params.id,req.body)
            .then((category) => {
                res.render('/admin/category', {admin: true,adminName: req.session.adminName,category})
            })
            console.log("id:",req.params.id );
            // .then((response) => {
            //     console.log(response);
            // })
        } catch(err) {
            console.log(err);
        } finally {
            res.redirect('/admin/category')
        }
    },
    editProduct: async(req,res) => {
        let product = await productHelpers.getProductDetails(req.params.id);
        adminHelpers.allCategories().then((category) => {
            console.log("product: ",product);
            res.render('admin/editProduct',{admin:true,category,adminName:req.session.adminName,product});
            })
        
    },

    editProductPost: async(req,res) => {     
        try {
            let imgUrls = []
            for(let i=0;i<req.files.length;i++){
                let result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrls.push(result.url);
            }
            if(imgUrls.length!==0){
                productHelpers.updateProductImages(req.params.id, imgUrls)
            }
            productHelpers.updateProduct(req.params.id,req.body)
        }catch(err){
            console.log(err);
        }finally{
            res.redirect('/admin/view-products');
        }       
    },
    listProduct : (req,res) => {
        productHelpers.listProduct(req.params.id).then(() => {
            res.redirect('back');
        })
    },
    unlistProduct: (req,res) => {
        productHelpers.unlistProduct(req.params.id).then(() => {
            res.redirect('back');
        })
    },
    // getCoupons: (req,res) => {
    //     if(req.session.adminLoggedIn) {
    //         adminHelpers.getAllCoupons().then((coupon) => {
    //             res.render('admin/coupon', {admin: true, adminName:req.session.adminName,coupon})
    //         })
    //     }else{
    //         res.render('admin/login');
    //     }
    // },
    // getCoupons: (req,res) => {
    //     adminHelpers.getAllCoupons().then((coupon) => {
    //         res.render('admin/coupon', {admin: true, adminName:req.session.adminName,coupon})
    //     })
    // },
    getCoupons: async(req,res) => {
        let coupons = await adminHelpers.getAllCoupons();
        coupons.forEach(coupon => {
            coupon.deactivated = coupon.status === 'DEACTIVATED'?true:false;
            coupon.expired = coupon.status === 'EXPIRED'?true:false;
        });
        console.log("567890-09876567890-=", coupons);
        res.render('admin/coupon', {admin: true, adminName:req.session.adminName, coupons});
    },
    addCouponPost: (req,res) => {
        //let code = req.body.code;
        adminHelpers.addCoupon(req.body).then(() => {
            res.redirect('/admin/coupon');
        })
    },
    activateCoupon: (req,res) => {
        adminHelpers.couponActivate(req.params.id).then(() => {
            res.redirect('back');
        })
    },
    deactivateCoupon: (req,res) => {
        adminHelpers.deactivateCoupon(req.params.id).then(() => {
            res.redirect('back');
        })
    },
    editCouponPost: (req,res) => {
        try {
            adminHelpers.updateCoupon(req.params.id, req.body)
            .then((coupon) => {
                res.render('/admin/coupon', {admin: true,adminName: req.session.adminName,coupon})
            })
        } catch(err) {
            console.log(err);
        } finally {
            res.redirect('/admin/coupon')
        }
    },
    deleteCoupon: (req,res) => {
        const couponId = req.params.id;
        adminHelpers.deleteCoupon(couponId).then(() => {
            // res.json({status: true})
            res.redirect('back')
        })
    },
    
    // orderManagement: async(req, res) => {
    //     if (req.session.adminLoggedIn) {
    //       const orders = await adminHelpers.allOrders();
    //       orders.forEach(order => {
    //         order.isCancelled = order.status === "cancelled" || order.status === 'delivered' ? true : false;
    //         order.isShipped = order.status === "shipped" ? true : false;
    //         order.isDelivered = order.status === "delivered" ? true : false;
    //         order.isPlaced = order.status === 'placed' || order.status === 'pending' ? true : false;
      
    //         // Check if the `date` property is a valid Date object
    //         if (order.date instanceof Date && !isNaN(order.date.valueOf())) {
    //           const months = ["JAN","FEB","MARCH","APRIL","MAY","JUNE","JULY","AUG","SEP","OCT","NOV","DEC"];
    //           order.date = order.date.getDate() + '-' + months[order.date.getMonth()] + '-' + order.date.getFullYear();
    //         }
    //       });
    //       res.render('admin/orderManagement', { admin: true, adminName: req.session.adminName, orders });
    //     } else {
    //       res.redirect('/admin/admin-login');
    //     }
    //   },
    orderManagement: async(req, res) => {
        
          const orders = await adminHelpers.allOrders();
          orders.forEach(order => {
            order.isCancelled = order.status === "cancelled" || order.status === 'delivered' || order.status === "returned"? true : false;
            order.isShipped = order.status === "shipped" ? true : false;
            order.isDelivered = order.status === "delivered" ? true : false;
            order.isPlaced = order.status === 'placed' || order.status === 'pending' ? true : false;
            order.isReturned = order.status === 'returned' ? true : false;
      
            // Check if the `date` property is a valid Date object
            if (order.date instanceof Date && !isNaN(order.date.valueOf())) {
              const months = ["JAN","FEB","MARCH","APRIL","MAY","JUNE","JULY","AUG","SEP","OCT","NOV","DEC"];
              order.date = order.date.getDate() + '-' + months[order.date.getMonth()] + '-' + order.date.getFullYear();
            }
          });
          res.render('admin/orderManagement', { admin: true, adminName: req.session.adminName, orders });

      },
    // singleOrderDetail: async(req,res) => {
    //     if(req.session.adminLoggedIn) {
    //         let orderId = req.params.id;
    //         let products = await productHelpers.getOrderedProducts(req.params.id);
    //         console.log("products:", products);
    //         adminHelpers.singleOrderView(orderId).then((deliveryDetails) => {
    //             console.log("deliveryDetails: ",deliveryDetails);
    //             res.render('admin/singleOrderDetail', {admin: true,adminName: req.session.adminName,products,deliveryDetails,orderId})
    //         });                       
    //     }else{
    //         res.render('admin/admin-login');
    //     }
    // },
    singleOrderDetail: async(req,res) => {
        let orderId = req.params.id;
        let products = await productHelpers.getOrderedProducts(req.params.id);
        console.log("products:", products);
        adminHelpers.singleOrderView(orderId).then((deliveryDetails) => {
            console.log("deliveryDetails: ",deliveryDetails);
            res.render('admin/singleOrderDetail', {admin: true,adminName: req.session.adminName,products,deliveryDetails,orderId})
        });                              
    },
    cancelOrder:(req,res) => {
        const orderId = req.params.id;
        adminHelpers.cancelOrder(orderId).then(() => {
            res.redirect('/admin/orderManagement');
        })
    },
    shipOrder: (req,res) => {
        const orderId = req.params.id;
        adminHelpers.shipOrder(orderId).then(() => {
            res.redirect('/admin/orderManagement')
        })
    },
    orderDelivered: (req,res) => {
        const orderId = req.params.id;
        adminHelpers.orderDelivered(orderId).then(() => {
            res.redirect('/admin/orderManagement');
        })
    },
    salesReport: (req,res) => {
        productHelpers.getAllSales().then((orders) => {
            const months = ["JAN","FEB","MARCH","APRIL","MAY","JUNE","JULY","AUG","SEP","OCT","NOV","DEC"];
            for(let i=0;i<orders.length;i++){
                orders[i].date = orders[i].date.getDate()+'-'+months[orders[i].date.getMonth()]+'-'+orders[i].date.getFullYear();
            }
            res.render('admin/sales', {admin: true,adminName: req.session.adminName, orders})
        })               
    },
    chartDetails: async(req,res) => {
        console.log('jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj');
        let delivers = await adminHelpers.deliverGraph();
        let orderStatus = await adminHelpers.ordersGraph();
        console.log(delivers, orderStatus);
        res.json({delivers, orderStatus});
    }   
}