const db=require('../config/connection');
const collection=require('../config/collections');
const bcrypt=require('bcrypt');
const adminHelpers=require('../helpers/admin-helpers');
const userHelpers=require('../helpers/user-helpers');
const { response } = require('express');
const { LogInstance } = require('twilio/lib/rest/serverless/v1/service/environment/log');
const productHelpers = require('../helpers/product-helpers');
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

    addProductPost:(req,res)=>{
        console.log(req.files);
    //console.log(req.body.image);
        productHelpers.addProduct(req.body,(id)=>{
            console.log(req.files);
            console.log(id);
            let img=req.files.image;        
            img.mv('./public/images/'+id+'.jpg',(err)=>{
                if(!err){
                    res.redirect('/admin/view-products');
                }else{
                    console.log(err);
                }
            })
        })
    }
}