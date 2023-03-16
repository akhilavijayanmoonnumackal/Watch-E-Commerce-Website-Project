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
        req.session.destroy();
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
    addProductGet:(req,res)=>{
        res.render('admin/add-product',{admin:true, adminName:req.session.adminName});
    },

    // addProductPost:async(req,res)=>{
    //     try{
    //         console.log(req.files)
    //         const id = await productHelpers.addProduct(req.body);
    //             let imgUrl = [];
    //             for(let i=0;i<req.files.length;i++){
    //                 const result = await cloudinary.uploader.upload(req.files[i].path);
    //                 imgUrl.push(result.url);
    //             }
    //             if(imgUrl.length != 0){
    //                 await productHelpers.addProductImages(id,imgUrl);
    //             }
    //             res.render('admin/view-products');
            
    //     }catch(err){
    //         console.log(err);
    //         res.status(500).send('Internal Server Error');
    //     }
    // },

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



    // addProductPost:(req,res)=>{
    //     try{
    //         console.log(req.files)
    //         productHelpers.addProduct(req.body,async(id) => {
    //             const imgUrl = [];
    //             for(let i=0;i<req.files.length;i++){
    //                 const result = await cloudinary.uploader.upload(req.files[i].path);
    //                 imgUrl.push(result.url);
    //             }
    //             if(imgUrl.length != 0){
    //                 productHelpers.addProductImages(id,imgUrl);
    //             }
    //         })
    //     }catch(err){
    //         console.log(err);
    //     }finally{
    //         res.render('admin/view-products');
    //     }
    // },
    //     console.log(req.files);
    // //console.log(req.body.image);
    //     productHelpers.addProduct(req.body,(id)=>{
    //         console.log(req.files);
    //         console.log(id);
    //         let img=req.files.image;        
    //         img.mv('./public/images/'+id+'.jpg',(err)=>{
    //             if(!err){
    //                 res.redirect('/admin/view-products');
    //             }else{
    //                 console.log(err);
    //             }
    //         })
    //     })
    // },
    bannerManagement:(req,res) => {
        if(req.session.adminLoggedIn){
            adminHelpers.bannerManagement().then((banner) => {
                console.log(banner);
                res.render('admin/bannerManagement', {admin:true,adminName:req.session.adminName})
            })
        }
    },
    addBannerGet:(req,res) => {
        res.render('admin/add-banner', {admin:true, adminName:req.session.adminName})
    },
    addBannerPost:(req,res) => {
        try {
            adminHelpers.addBanner(req.body,async(id) => {
                let imgUrl = [];
                for(let i=0;i<req.files.length;i++){
                    const result = await cloudinary.uploader.upload(req.files[i].path);
                    imgUrl.push(result.url);
                }
                if(imgUrl.length != 0){
                    adminHelpers.addBannerImages(id,imgUrl);
                }
            })
        }catch(err){
            console.log(err);
        }finally{
            res.render('admin/bannerManangement');
        }
    }
}