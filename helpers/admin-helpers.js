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
            console.log(admin?.password);
            if(admin){
                if(admin?.password==adminData.pass){
                    response.admin=admin;
                    response.adminName=admin.name;
                    response.status=true;
                    resolve(response);
                }else{
                    console.log('invalid');
                    resolve({status:false})
                }
            }else{
                console.log('admin not found');
                resolve({status:false})
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
        console.log("999999999999999999", bannerUrl);
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
        console.log("tttttttttttttttt", banner);
        return new Promise((resolve,reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .updateOne({_id: new ObjectId(bannerId)},
            {
                $set:
                {
                    head: banner.head,
                    text: banner.text
                }
            }).then((response) => {
                console.log("888888888888uuuuuu", response);
                resolve(response);
            })
        })
    },

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
                console.log("uuuuuuuuuuuuuuuuuuuuuyyyyyyyyyyyyy", response);
                resolve(response);
            })
        })
    },
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
    deleteBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION)
            .deleteOne(
                {
                    _id: new ObjectId(bannerId)
                }
            ).then((response) => {
                console.log("rtyuioxcvvvvvvvvvvv",response);
                resolve()
            })
        })
    },
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
            const coupons = await db.get().collection(collection.COUPON_COLLECTION)
            .find().toArray();
            const newDate = new Date();
            coupons.forEach(coupon => {
                if(coupon.date < newDate) {
                    coupon.status = "EXPIRED";
                }
                const months = ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC"];
                const dateObj = new Date(coupon.date);
                const day = dateObj.getDate().toString().padStart(2, "0");
                const month = months[dateObj.getMonth()];
                const year = dateObj.getFullYear();
                coupon.date = `${day}-${month}-${year}`;

            })
            resolve(coupons);
        })
    },
    addCoupon: (coupon) => {       
        return new Promise(async(resolve,reject) => {
            coupon.discount = Number(coupon.discount);
            coupon.date = new Date(coupon.date);
            coupon.status=true;
            const newDate = new Date();
            if(coupon.date < newDate) {
                coupon.status = 'EXPIRED';
            }
            const couponExist = await db.get().collection(collection.COUPON_COLLECTION)
            .findOne({ code: coupon.code});
            if(couponExist) {
                resolve(null);
            }else{
                db.get().collection(collection.COUPON_COLLECTION)
                .insertOne(coupon).then((response) => {
                resolve();
                })
            }   
        })
    },
    // addCoupon: (coupon) => {       
    //     return new Promise((resolve,reject) => {
    //         coupon.discount = Number(coupon.discount);
    //         coupon.date = new Date(coupon.date);
    //         coupon.status=true;
    //         const newDate = new Date();
            
    //         db.get().collection(collection.COUPON_COLLECTION)
    //         .insertOne(coupon).then((response) => {
    //             resolve(response);
    //         })
    //     })
    // },
    couponActivate: (couponId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.COUPON_COLLECTION)
            .updateOne({_id: new ObjectId(couponId)},
            {
                $set:
                {
                    status:true
                }
            }).then(() => {
                //console.log(response);
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
                    status:'DEACTIVATED'
                }
            }).then(() => {
                //console.log(response);
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
    deleteCoupon:(couponId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION)
            .deleteOne(
                {
                    _id: new ObjectId(couponId)
                }
                ).then((response) => {
                    console.log("tttt",response);
                    resolve()
                })
        })
    },
    // removeProduct: (userId, proId) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.CART_COLLECTION)
    //         .updateOne(
    //             {
    //                 userId: new ObjectId(userId)
    //             },
    //             {
    //                 $pull: { 
    //                     products: { productId: new ObjectId(proId) } 
    //                 }
    //             }
    //         ).then((response) => {
    //             console.log(response)
    //             resolve()
    //         }).catch((err)=>{
    //             console.log(err);
    //         })
    //     })
    // }
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
    },
    cancelOrder: (orderId) => {
        return new Promise((resolve,reject) => {
            orderId = new ObjectId(orderId);
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
                {
                    _id: orderId
                },
                {
                    $set:{
                        status: 'cancelled'
                    }
                }
            ).then((response) => {
                resolve(response);
            })
        })
    },
    shipOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            orderId = new ObjectId(orderId);
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
                {
                    _id: orderId
                },
                {
                    $set:{
                        status: 'shipped'
                    }
                }
            ).then((response) => {
                resolve(response);
            })
        })
    },
    orderDelivered: (orderId) => {
        return new Promise((resolve,reject) => {
            orderId = new ObjectId(orderId);
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
                {
                    _id: orderId
                },
                {
                    $set:{
                        status: 'delivered'
                    }
                }
            ).then((response) => {
                resolve(response);
            })
        })
    },
    getUsersCount: () => { 
        return new Promise(async(resolve, reject) => {
            const users = await db.get().collection(collection.USER_COLLECTION)
            .find().toArray();
            const usersCount = users.length>0?users.length : 0;
            console.log("userCount", usersCount);
            resolve(usersCount)
            console.log("876456789hjgfghjk", usersCount);
        }).catch(() => {
            reject(null);
        });
    },
    getLastMonthTotal: () => {
        return new Promise(async(resolve,reject) => {
            const newDate = new Date();
            const year = newDate.getFullYear();
            const month = newDate.getMonth();
            const day = newDate.getDate();
            const total = await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
                {
                  '$match': {
                    'status': 'delivered', 
                    'date': {
                      '$lte': newDate
                    }
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'totalCost': {
                      '$sum': '$totalAmount'
                    }
                  }
                }
              ]).toArray();
              console.log("uuuuuuuuuuuuuuu",total);
            resolve(total);
        })
    },
    getOrderTotalPrice:() => {
        return new Promise(async(resolve,reject) => {
            const totalOrderPrice = await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
                {
                  '$match': {
                    'status': 'delivered'
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'totalCost': {
                      '$sum': '$totalAmount'
                    }
                  }
                }
              ]).toArray();
              if(totalOrderPrice[0]) {
                resolve(totalOrderPrice[0].totalCost);
              }else{
                resolve(0);
              }
            
        })
    },
    deliverGraph: () => {
        return new Promise(async(resolve, reject) => {
            console.log('lllllllllllllllllllllllllllllllllllllllllllllllllllllll');
            let result = await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
                {
                  '$match': {
                    'status': 'delivered'
                  }
                }, {
                  '$group': {
                    '_id': {
                      '$month': '$date'
                    }, 
                    'count': {
                      '$sum': 1
                    }
                  }
                }
            ]).toArray();
            console.log("graphhhhhhhh", result);
            resolve(result);
        })
    },
    ordersGraph: () => {
        return new Promise(async(resolve, reject) => {
            let result = await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
                {
                  '$group': {
                    '_id': '$status', 
                    'count': {
                      '$sum': 1
                    }
                  }
                }, {
                  '$sort': {
                    '_id': 1
                  }
                }
              ]).toArray();
              console.log("pie chart", result);
              resolve(result);
        })
    }
}