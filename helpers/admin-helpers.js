const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { Reject } = require('twilio/lib/twiml/VoiceResponse')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const collections = require('../config/collections')
const { reject } = require('bcrypt/promises')
const async = require('hbs/lib/async')


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

    // isCategoryNameExist: (name) => {
    //     return new Promise(async(resolve,reject) => {
    //         const category = await db.get().collection(collection.CATEGORY_COLLECTION)
    //         .findOne({name: name.trim().toLowerCase() });    
    //         if(category) {
    //             resolve(category)
    //             console.log("category name", category);
    //         }else{
    //             resolve()
    //         }
    //     })
    // },

    isCategoryNameExist: (name) => {
        return new Promise(async(resolve,reject) => {
            const category = await db.get().collection(collection.CATEGORY_COLLECTION)
            .findOne({name: name});
            if(category) {
                resolve(category)
                console.log("category name", category);
            }else{
                resolve()
            }
        })
    },

    
    // allCategories: () => {
    //     return new Promise(async(resolve,reject) => {
    //         let category = await db.get().collection(collection.CATEGORY_COLLECTION)
    //         .find().toArray();
    //         resolve(category);
    //     })
    // },

    allCategories: () => {
        return new Promise(async(resolve,reject) => {
            try {
                let category = await db.get().collection(collection.CATEGORY_COLLECTION)
                .find().toArray();
                resolve(category);
            }catch(err){
                reject(err);
            }            
        })
    },
    getAllCategories: (filter = {status:true}) => {
        return new Promise(async(resolve, reject) => {
            try {
                let category = await db.get().collection(collection.CATEGORY_COLLECTION)
                .find(filter).toArray();
                resolve(category);
            }catch(err){
                reject(err)
            }
        })        
    },

    addCategory: (category) => {
        category.status=true;
        return new Promise((resolve,reject) => {
             db.get().collection(collection.CATEGORY_COLLECTION)
            .insertOne(category).then((data) => {
                resolve(data);
            });
            
        })
    },
    updateCategory: (categoryId, category) => {
        console.log("categoryId:", categoryId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id: new ObjectId(categoryId)},
            {
                $set:
                {
                    name: category.name
                }
            }).then((response) => {
                console.log("response cat", response);
                resolve(response);
            })
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
    },
    getAllCoupons: () => {
        return new Promise(async(resolve,reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION)
            .find().toArray();
            resolve(coupon);
        })
    },
    addCoupon: (coupon) => {
        coupon.status=true;
        return new Promise((resolve,reject) => {
            db.get().collection(collection.COUPON_COLLECTION)
            .insertOne(coupon).then((data) => {
                resolve(data)
            })
        })
    },
    couponActivate: (couponId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.COUPON_COLLECTION)
            .updateOne({_id: new ObjectId(couponId)},
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
    deactivateCoupon: (couponId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.COUPON_COLLECTION)
            .updateOne({_id: new ObjectId(couponId)},
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
    updateCoupon: (couponId, coupon) => {
        return new Promise((resolve,reject) => {
            let status = coupon[status]
            db.get().collection(collection.COUPON_COLLECTION)
            .updateOne({_id: new ObjectId(couponId)},
            {
                $set:
                {
                    // userId: new ObjectId(coupon.userId),
                    code:coupon.code,
                    discount:coupon.discount,
                    description:coupon.description,
                    expDate:new Date(),
                    status:status
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    allOrders: () => {
        return new Promise(async(resolve,reject) => {
            try {
                let order = await db.get().collection(collection.ORDER_COLLECTION)
                .find().toArray();
                resolve(order)
            }catch(err) {
                reject(err)
            }
        })
    },
    singleOrderView: (orderId) => {
        return new Promise(async(resolve,reject) => {
            await db.get().collection(collection.ORDER_COLLECTION)
            .findOne({_id: new ObjectId(orderId)})
            .then((response) => {
                resolve(response);
            })
        })
    }
}