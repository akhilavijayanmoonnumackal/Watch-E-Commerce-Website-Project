const db=require('../config/connection');
const collection=require('../config/collections');
const bcrypt=require('bcrypt')
const userHelpers=require('../helpers/user-helpers');
const { response } = require('express');
const twilioApi = require('../api/twilio') ;
const { verifyOtp } = require('../api/twilio');
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
            if(response.status){   
                    if(response.isBlocked){
                        req.session.loggedIn=true;
                        req.session.user=response.user;
                        res.redirect('/');
                    }else{
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
       res.render('user/otp-login')
    },
    sendOtp: (req, res)=>{       
       console.log(req.body.phone);
       req.session.mobile = req.body.phone;
       twilioApi.sendOtp(req.body.phone).then((result) =>{
        res.json({status : true})
       })

    },
    verifyOtp : (req, res) =>{
        console.log(req.body.otp);
        twilioApi.verifyOtp(req.session.mobile, req.body.otp).then((result) =>{
            
        })
    }
    
}
