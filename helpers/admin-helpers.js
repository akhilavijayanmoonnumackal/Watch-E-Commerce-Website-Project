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
            let banner = await db.get().collection(collection.BANNER_COLLECTION)
            .find().toArray();
            resolve(banner);
        })
    },
    addBanner: (banner,callback) => {          //1
        return new Promise((resolve, reject) => {
            banner.status=true;
            db.get().collection(collection.BANNER_COLLECTION)
            .insertOne(banner).then((data) => {
            callback(data.insertedId);
            })
        })
        
    },
    updateBannerImages: (bannerId,bannerUrl) => {        //1
        return new Promise((resolve,reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .updateOne({_id: new ObjectId(bannerId)},
            {
                $set: 
                    {
                        image: bannerUrl
                    }
            })
        }) 
    },
    updateBanner: (bannerId,banner) => {    //1
        return new Promise((resolve,reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .updateOne({_id: new ObjectId(bannerId)},
            {
                $set:
                {
                    head: banner.head,
                    text: banner.text
                }
            });
        })
    },
    // bannerList: (bannerId) => {
    //     return new Promise((resolve,reject) => {
    //         db.get().collection(collection.BANNER_COLLECTION)
    //         .updateOne({_id:new ObjectId(bannerId)}, {$set: {status:false}})
    //         .then((response) => {
    //             resolve();
    //         })
    //     })
    // },
    getBanners: () => {    //1
        return new Promise(async(resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION)
            .find().toArray();
            resolve(banner);
        })
    },
    getBannerDetails: (bannerId) => {    //1
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .findOne({_id: new ObjectId(bannerId)})
            .then((response) => {
                resolve(response);
            })
        })
    },
    // bannerUnlist: (bannerId) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.BANNER_COLLECTION)
    //         .updateOne({_id: new ObjectId(bannerId)},
    //         {
    //             $set:
    //             {
    //                 status: false
    //             }
    //         }).then((response) => {
    //             resolve();
    //         })
    //     })
    // },
    bannerList:(bannerId) => {    //1
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .updateOne({_id: new ObjectId(bannerId)},
            {
                $set:
                {
                    status:true
                }
            }).then((response) => {
                console.log(response);
                resolve();
            })
        })
    },
    unListbanner:(bannerId) => {    //1
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .updateOne({_id: new ObjectId(bannerId)},
            {
                $set:
                {
                    status:false
                }
            }).then((response) => {
                console.log(response);
                resolve();
            })
        })
    },
    isCategoryExist: async(categoryName) => {
        const category = await db.get().collection(collection.CATEGORY_COLLECTION)
        .findOne({categoryName:categoryName});
        return category;
    },
    allCategories: () => {
        return new Promise(async(resolve,reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION)
            .find().toArray();
            resolve(category);
        })
    },
    addCategory: (categoryData) => {
        categoryData.status=true;
        return new Promise((resolve,reject) => {
             db.get().collection(collection.CATEGORY_COLLECTION)
            .insertOne(categoryData).then((data) => {
                resolve(data);
            });
            
        })
    },
    // bannerList:(bannerId) => {    //1
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.BANNER_COLLECTION)
    //         .updateOne({_id: new ObjectId(bannerId)},
    //         {
    //             $set:
    //             {
    //                 status:true
    //             }
    //         }).then((response) => {
    //             console.log(response);
    //             resolve();
    //         })
    //     })
    // }
    categoryList: (categoryId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id: new ObjectId(categoryId)},
            {
                $set:
                {
                    status:true
                }
            }).then((response) => {
                console.log(response);
                resolve();
            })
        })
    },
    categoryUnlist: (categoryId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id: new ObjectId(categoryId)},
            {
                $set:
                {
                    status:false
                }
            }).then((response) => {
                console.log(response);
                resolve();
            })
        })
    }
}