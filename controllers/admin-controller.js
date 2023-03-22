const db=require('../config/connection');
const collection=require('../config/collections');
const bcrypt=require('bcrypt');
const adminHelpers=require('../helpers/admin-helpers');
const userHelpers=require('../helpers/user-helpers');
const { response } = require('express');
const { LogInstance } = require('twilio/lib/rest/serverless/v1/service/environment/log');
const productHelpers = require('../helpers/product-helpers');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const { ObjectId } = require('mongodb');
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
            res.render('admin/admin-login', {adminLoginErr:req.session.adminLoginErr,admin,adminHeader:true});
            req.session.adminLoginErr=false
        }
    },
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
                //console.log("ytfvughbjnkmldxcfvgbhj****************")
                res.render('admin/dashboard', {admin, adminHeader:true, adminName:req.session.adminName});
            }else{
                req.session.adminLoginErr="Invalid username or password"
                res.redirect('/admin');
            }
        })
    },
    dashBoard:(req,res)=>{

        if(req.session.adminLoggedIn){
            console.log(req.session.adminName);
            res.render('admin/dashboard', {admin:true, adminName:req.session.adminName});
        }else{
            res.redirect('/admin/admin-login');
        }
    },
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
    viewProducts:(req,res)=>{
        if(req.session.adminLoggedIn){
            productHelpers.viewProducts().then((products)=>{
                console.log(products);
                res.render('admin/view-products',{admin:true, products,adminName:req.session.adminName});
            })
        }else{
            res.redirect('/admin/admin-login')
        }
    },
    addProductGet: async(req,res)=>{
       if(req.session.adminLoggedIn){
        adminHelpers.allCategories().then((category) => {
            console.log(category);
            res.render('admin/add-product',{admin:true,category, adminName:req.session.adminName});
        })
       }        
    },
    addProductPost:async(req,res)=>{
        try{
            console.log(req.files)
            
                const imgUrl = [];
                for(let i=0;i<req.files.length;i++){
                    const result = await cloudinary.uploader.upload(req.files[i].path);
                    imgUrl.push(result.url);
                    console.log(result.url);
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
    bannerManagement:(req,res) => {       //1
        if(req.session.adminLoggedIn){
            adminHelpers.getBanners().then((banner) => {
                //console.log(banner);
                res.render('admin/bannerManagement', {admin:true,banner,adminName:req.session.adminName})
            })
        }else{
            res.redirect('/admin/admin-login')
        }
    },
    addBannerGet:(req,res) => {          //1
        res.render('admin/add-banner', {admin:true, adminName:req.session.adminName})
    },
    addBannerPost:async(req,res) => {           //1
        try {
            //console.log(req.files);
                adminHelpers.addBanner(req.body,async(id) => {
                    let result = await cloudinary.uploader.upload(req.file.path);
                    adminHelpers.updateBannerImages(id,result.url);
                })
        }catch(err){
            console.log(err);
        }finally{
            res.redirect('/admin/bannerManangement');
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
    editBanner:(req,res) => {     //1
        adminHelpers.getBannerDetails(req.params.id);
        res.render('admin/edit-banner', {admin:true, adminName:req.session.adminName,banner})
    },
    editBannerPost: async (req,res) => {     //1
        try{
            adminHelpers.updateBanner(req.param.id, req.body);
            let result = await cloudinary.uploader.upload(req.file.path);
            if(result.url) {
                adminHelpers.updateBannerImages(req.params.id, result.url);
            }
        }catch(err){
            console.log("error", err);
        }finally{
            res.redirect('/admin/bannerManagement');
        }
    },
    getBannerDetails: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .findOne({_id: new ObjectId(bannerId)})
            .then((response) => {
                resolve(response);
            })
        })
    }, 
    // updateBanner:(bannerId, banner) =>{
    //     return new Promise((resolve, reject => {
    //         db.get().collection(collection.BANNER_COLLECTION)
    //         .updateOne({_id:new ObjectId(bannerId)},
    //         {
    //             $set: {
    //                 head: banner.head,
    //                 text: banner.text
    //             }
    //         });
    //     }))
    // },
    // updateBannerImages: (bannerId,bannerUrl) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.BANNER_COLLECTION)
    //         .updateOne({_id: new ObjectId(bannerId)},
    //         {
    //             $set: 
    //             {
    //                 image: bannerUrl
    //             }
    //         })
    //     })
    // },
    getAllBanners: () => {
        return new Promise(async(resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION)
            .find().toArray();
            resolve(banners);
        })
    },
  
    addCategoryPost: (req,res) => {
        adminHelpers.addCategory(req.body).then((response) => {
            res.redirect('/admin/category');
        })
    },
    // addBannerPost:async(req,res) => {           //1
    //     try {
    //         //console.log(req.files);
    //             adminHelpers.addBanner(req.body,async(id) => {
    //                 let result = await cloudinary.uploader.upload(req.file.path);
    //                 adminHelpers.updateBannerImages(id,result.url);
    //             })
    //     }catch(err){
    //         console.log(err);
    //     }finally{
    //         res.redirect('/admin/bannerManangement');
    //     }
    // }
    categoryManagement: (req,res) => {
        if(req.session.adminLoggedIn){
        adminHelpers.allCategories().then((category) => {
            res.render('admin/category', {admin:true, adminName:req.session.adminName,category})
        })
        }else{
            res.redirect('/admin/login')
        }       
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
    editProduct: async(req,res) => {
        let product = await productHelpers.getProductDetails(req.params.id)
        console.log(product);
        res.render('admin/editProduct',{admin:true, adminName:req.session.adminName,product});
    },
    editProductPost: async(req,res) => {
        try {
            productHelpers.updateProduct(req.params.id,req.body);
            let result = await cloudinary.uploader.upload(req.files.path);
            if(result.url) {
                productHelpers.updateProductImages(req.params.id, result.url);
            }
        }catch(err){
            console.log("error",err);
        }finally{
            res.redirect('/admin/view-products')
        }
        // let id = req.params.id;
        // productHelpers.updateProduct(req.params.id,req.body).then(() => {
        //     res.redirect('/admin/view-products')
        //     if(req.files.image)
        // })
    }
    // editBannerPost: async (req,res) => {     //1
    //     try{
    //         adminHelpers.updateBanner(req.param.id, req.body);
    //         let result = await cloudinary.uploader.upload(req.file.path);
    //         if(result.url) {
    //             adminHelpers.updateBannerImages(req.params.id, result.url);
    //         }
    //     }catch(err){
    //         console.log("error", err);
    //     }finally{
    //         res.redirect('/admin/bannerManagement');
    //     }
    // }
}