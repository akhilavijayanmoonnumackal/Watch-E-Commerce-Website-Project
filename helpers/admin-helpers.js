const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { Reject } = require('twilio/lib/twiml/VoiceResponse')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const collections = require('../config/collections')

module.exports={
    adminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            console.log(adminData.pass)
            let admin=await db.get().collection(collection.ADMIN_COLLECTION)
            .findOne({email: adminData.username});
            console.log(admin.password);
            if(admin){
                if(admin.password==adminData.pass){
                    response.admin=admin;
                    response.adminName=admin.name;
                    response.status=true;
                    resolve(response);
                }else{
                    console.log('admin not found');
                    resolve({status:false})
                }
            }
        })
    },
    getUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION)
            .find().toArray()
            resolve(user)
        })
    },
    blockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:new ObjectId(userId)},{$set:{userStatus:false}})
            .then((response)=>{
                resolve(response)
                console.log(response);
            })
        })
    },
    unblockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:new ObjectId(userId)},{$set:{userStatus:true}})
            .then((response)=>{
                resolve(response)
                console.log(response);
            })
        })
    },
    bannerManagement:() => {
        return new Promise(async(resolve, reject) => {
            let banner = await db.get().collection(collections.BANNER_COLLECTION)
            .find().toArray();
            resolve(banner);
        })
    },
    addBanner: (banner,callback) => {
        db.get().collection(collections.BANNER_COLLECTION)
        .insertOne(banner).then((data) => {
            callback(data.insertedId);
        })
    },
    addBannerImages: () => {

    }
}