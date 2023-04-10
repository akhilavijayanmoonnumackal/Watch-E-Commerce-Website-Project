const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
var ObjectId=require('mongodb-legacy').ObjectId;
const collections = require('../config/collections');
const { response } = require('express');
const { reject } = require('bcrypt/promises');
const async = require('hbs/lib/async');
const Razorpay = require('razorpay');
const { resolve } = require('path');
const { log } = require('console');
//const { use } = require('../routes/user')

var instance = new Razorpay({
    key_id: 'rzp_test_266WOnlg6wbzrr',
    key_secret: 'EIOfYjOsCq8l4hFSvebKWHtf',
});

module.exports={
    doSignUp:(userData)=>{
        //console.log(userData);
        return new Promise(async(resolve, reject)=>{
            userData.password=await bcrypt.hash(userData.password,10);
            userData.userStatus = true;
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async(data)=>{
                //resolve(data.insertedId)
                dataDoc=await db.get().collection(collection.USER_COLLECTION).findOne({_id:data.insertedId});
                resolve(dataDoc);
            })           
        })
        
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email});
            console.log(user);
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        response.status=true;
                        if(user.userStatus){
                            response.user=user;
                            response.isBlocked = user.userStatus;
                            console.log("correct");
                            resolve(response);
                        }else{
                            console.log("somethong fishy");
                            response.isBlocked = user.userStatus;
                            resolve(response);
                        } 
                    }else{
                        // console.log('login failed');
                        resolve({status:false})
                    }
                })              
            }else{
                console.log("user not found !!");
                resolve({status:false});
            }
        })
    },
    checkForUser :(mobile) =>{
       return new Promise( async (resolve, reject) =>{
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({phone : mobile});
        if(user){
            resolve(user)
        }else{
            user = null;
            resolve(user);
        }
       })
    },
    addToCart:(userId,productId,quantity)=>{
        return new Promise(async(resolve,reject) => {
            userId = new ObjectId(userId);
            productId = new ObjectId(productId);
            console.log("helpers here ~!!")
            quantity = Number(quantity);
            const isCart = await db.get().collection(collection.CART_COLLECTION).findOne({userId:userId});
            console.log(isCart)
            const proExist = await db.get().collection(collections.CART_COLLECTION)
            .findOne(
                {
                    userId:userId,
                    products:{$elemMatch:
                    {productId}}
                });
                // console.log(proExist);
            if (isCart) {
                if(proExist){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne(
                        {
                        userId:userId, 
                        products:{$elemMatch:{productId}}
                    },
                    {
                        $inc:{"products.$.quantity":quantity},
                    })
                    .then((response) => {
                        console.log(`increment ${response}`);
                        resolve(response)
                    });
                }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne(
                        {
                            userId:userId
                        },
                        {
                            $push:{
                                products: {productId: productId, quantity:1},
                            }
                        }
                    )
                    .then((response)=>{
                        console.log(`added : ${response}`);
                        resolve(response);
                    })
                }
            }else{
                let cartObj={
                    userId:userId,
                    products:[{productId, quantity:quantity}]
                }
                db.get().collection(collection.CART_COLLECTION)
                .insertOne(cartObj)
                .then((response) => {
                    console.log(` inserted : ${response}`);
                    resolve(response);
                });
            }           
        })
    },
    cartDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            userId = new ObjectId(userId);
            let cartItems = await db.get().collection(collection.CART_COLLECTION)
            .aggregate([
                {
                  '$match': {
                    'userId': userId
                  }
                }, {
                  '$unwind': {
                    'path': '$products', 
                    'preserveNullAndEmptyArrays': true
                  }
                }, {
                  '$lookup': {
                    'from': 'products', 
                    'localField': 'products.productId', 
                    'foreignField': '_id', 
                    'as': 'proDetails'
                  }
                }, {
                  '$project': {
                    'proDetails': 1, 
                    'products.quantity': 1, 
                    '_id': 0
                  }
                }
              ]).toArray();
            console.log(cartItems)
            console.log("fdgffffffffffffffffffffff",cartItems.length);
            if(cartItems.length!=0){
                if(cartItems.length===1){
                    if(cartItems[0].proDetails.length===0){
                        console.log("noijas")
                        console.log(`prodetailslength : ${cartItems[0].proDetails.length}`);
                        resolve(null);
                    }
                }
                resolve(cartItems)
            }else{
                resolve(null);
            }
          } catch {
            resolve(null);
            }
        });
      },
    getCartCount: (userId) => {
        return new Promise(async (resolve,reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION)
            .findOne({ userId: new ObjectId(userId)})
            if(cart) { 
                count = cart.products.length
            }
            console.log(cart)
            // console.log(cart.products.length)
            resolve(count)
        })
    },
     changeProductQuantity: (details, userId) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        const productId = new ObjectId(details.product);
        return new Promise((resolve,reject) => {
            if(details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:new ObjectId(details.cart) },
                {
                    $pull: { products: { item: new ObjectId(details.product) } }
                }
                ).then(() => {
                    resolve({ removeProduct: true })
                }) 
            } else {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne(
                    {
                        userId: new ObjectId(userId), 
                        products: {$elemMatch: {productId}}
                    },
                    {
                        $inc: { 'products.$.quantity' : details.count }
                    }
                    ).then(() => {
                        resolve({status:true});
                    })
            }
        })
    },
    removeProduct: (userId, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne(
                {
                    userId: new ObjectId(userId)
                },
                {
                    $pull: { 
                        products: { productId: new ObjectId(proId) } 
                    }
                }
            ).then((response) => {
                console.log(response)
                resolve()
            }).catch((err)=>{
                console.log(err);
            })
        })
    },
    
    get1TotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
              userId = new ObjectId(userId);
              let total = await db.get().collection(collection.CART_COLLECTION)
              .aggregate([
                  {
                    '$match': {
                      'userId': userId
                    }
                  }, {
                    '$unwind': {
                      'path': '$products', 
                      'preserveNullAndEmptyArrays': true
                    }
                  }, {
                    '$lookup': {
                      'from': 'products', 
                      'localField': 'products.productId', 
                      'foreignField': '_id', 
                      'as': 'proDetails'
                    }
                  },
                  {
                    '$unwind':{'path':'$proDetails'}
                  },{
                    '$group':{
                        '_id':'null',
                        'total': {'$sum': {'$multiply': ['$products.quantity','$proDetails.price']}}
                    }
                  }
                ]).toArray()
                try{
                    console.log("total", total[0].total)
                    //console.log(cartItems.length);
                    resolve(total[0].total);
                }catch{
                    resolve(0);
                }
            } 
            catch(err) {
                console.log(err);
              resolve(null);
              }
          });
    },
    getWishList: (proId,userId) => {
        return new Promise(async(resolve,reject) => {
            let productId =new ObjectId(proId)
            let userid =new ObjectId(userId)
            let userName = await db.get().collection(collection.WISHLIST_COLLECTION)
            .findOne({ user:userid})
            if(!userName) {
                let product = []
                product.push(productId)

                let obj = {
                    user : userid,
                    product : product
                }
                db.get().collection(collection.WISHLIST_COLLECTION)
                .insertOne(obj).then((response) => {
                    console.log(response);
                    resolve(true)
                })
            }else{
                let proExist = await userName.product.findIndex(check => check.toString() == ObjectId(proId).toString())
                console.log(proExist);
                if(proExist != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({ user: userid},
                        {
                            $pull: { product: ObjectId(proId) }
                        }
                        ).then((response) => {
                            console.log(response);
                            resolve(false)
                        })
                }else{
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({ user: userid},
                        {
                            $pull: { product: ObjectId(proId) }
                        })
                        resolve(true)
                }
            }
        })
    },

    wishListDetails:(userId) => {
        return new Promise(async(resolve,reject) => {
            try {
                userId = new ObjectId(userId);
                result = await db.get().collection(collections.WISHLIST_COLLECTION)
            .aggregate(
                [
                    {
                      '$match': {
                        'userId': new ObjectId(userId)
                      }
                    }, {
                      '$unwind': {
                        'path': '$products', 
                        'preserveNullAndEmptyArrays': true
                      }
                    }, {
                      '$lookup': {
                        'from': 'products', 
                        'localField': 'products', 
                        'foreignField': '_id', 
                        'as': 'productDetails'
                      }
                    }, {
                      '$project': {
                        'productDetails': 1, 
                        'products.quantity': 1, 
                        '_id': 0
                      }
                    }
                  ]
            ).toArray();
            console.log("result",result);
            console.log("yyyyyyyyyy",result.length);
            if(result.length!=0){
                if(result.length===1) {
                    if(result[0].productDetails.length===0){
                        console.log(`wishDetails : ${result[0].productDetails.length}`);
                        resolve(null)
                    }
                }
                resolve(result)
            }else{
                resolve(null)
                }           
            } catch {
                resolve(null)
            }
            
        })
    },

    // cartDetails: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //       try {
    //         userId = new ObjectId(userId);
    //         let cartItems = await db.get().collection(collection.CART_COLLECTION)
    //         .aggregate([
    //             {
    //               '$match': {
    //                 'userId': userId
    //               }
    //             }, {
    //               '$unwind': {
    //                 'path': '$products', 
    //                 'preserveNullAndEmptyArrays': true
    //               }
    //             }, {
    //               '$lookup': {
    //                 'from': 'products', 
    //                 'localField': 'products.productId', 
    //                 'foreignField': '_id', 
    //                 'as': 'proDetails'
    //               }
    //             }, {
    //               '$project': {
    //                 'proDetails': 1, 
    //                 'products.quantity': 1, 
    //                 '_id': 0
    //               }
    //             }
    //           ]).toArray();
    //         console.log(cartItems)
    //         console.log("fdgffffffffffffffffffffff",cartItems.length);
    //         if(cartItems.length!=0){
    //             if(cartItems.length===1){
    //                 if(cartItems[0].proDetails.length===0){
    //                     console.log("noijas")
    //                     console.log(`prodetailslength : ${cartItems[0].proDetails.length}`);
    //                     resolve(null);
    //                 }
    //             }
    //             resolve(cartItems)
    //         }else{
    //             resolve(null);
    //         }
    //       } catch {
    //         resolve(null);
    //         }
    //     });
    //   },



    // addToWishlist:(userId, productId, wishQuantity)=>{
    //     return new Promise(async(resolve, reject)=>{
    //         userId = new ObjectId(userId);
    //         productId = new ObjectId(productId);
    //         wishQuantity=Number(wishQuantity)
    //         const isWishList = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({userId: userId});
    //         const proWishExist = await db.get().collection(collection.WISHLIST_COLLECTION)
    //         .findOne(
    //             {
    //                 userId:userId,
    //                 products:{$elemMatch:{productId}}
    //             }
    //         );
    //         console.log(proWishExist);
    //         if(isWishList){
    //             if(proWishExist) {
    //                 db.get().collection(collections.WISHLIST_COLLECTION)
    //                 .updateOne(
    //                     {
    //                         userId: userId
    //                     },
    //                     {
    //                         $push:{
    //                             products: productId
    //                         }
    //                     }
    //                 )
    //                 .then((response)=>{
    //                     resolve(response);
    //                 });                
    //         }else{
    //             let wishList={
    //                 userId : userId,
    //                 products : [productId],
    //             }
    //             db.get().collection(collections.WISHLIST_COLLECTION)
    //             .insertOne(wishList)
    //             .then((response)=>{
    //                 resolve(response);
    //                 });
    //             }
    //         }
    //     })
    // },

    addToWishlist:(userId, productId,quantity)=>{
        return new Promise(async(resolve, reject)=>{
            userId = new ObjectId(userId);
            productId = new ObjectId(productId);
            quantity=Number(quantity)
            const isWishList = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({userId: userId});
            if(isWishList){
                db.get().collection(collections.WISHLIST_COLLECTION)
                .updateOne(
                    {
                        userId: userId
                    },
                    {
                        $push:{
                            products: productId
                        }
                    }
                )
                .then((response)=>{
                    resolve(response);
                });
            }else{
                let wishList={
                    userId : userId,
                    products : [productId],
                }
                db.get().collection(collections.WISHLIST_COLLECTION)
                .insertOne(wishList)
                .then((response)=>{
                    resolve(response);
                });
            }
        })
    },


    removeWishlistProduct:(userId, proId) => {
        console.log(userId,proId,'00000000000000000000000000000000000000000000000000000000000000000');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne(
                {
                    userId: new ObjectId(userId)
                },
                {
                    $pull: {
                        products: new ObjectId(proId)
                    }
                }
            ).then((response) => {
                console.log("remove",response);
                resolve()
            }).catch((err) => {
                console.log(err);
            })
        })
    },

    // placeOrder: (order, products, totalPrice) => {
    //     return new Promise((resolve,reject) => {
    //         console.log(order,products,totalPrice);
    //         let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
    //         let orderObj = {
    //             deliveryDetails: {
    //                 name: order.name,
    //                 mobile: order.mobile,
    //                 address: order.address,
    //                 pincode: order.pincode
    //             },
    //             userId: new ObjectId(order.userId),
    //             PaymentMethod: order['payment-method'],
    //             products: products,
    //             totalAmount: totalPrice,
    //             status: status,
    //             date: new Date()
    //         }

    //         db.get().collection(collection.ORDER_COLLECTION)
    //         .insertOne(orderObj)
    //         .then((response) => {
    //             db.get().collection(collection.CART_COLLECTION)
    //             .deleteOne({ userId: new ObjectId(order.userId)})
    //             .then((response2)=>{
    //                 console.log(response2)
    //                 resolve(response.insertedId)
    //             })
    //         })
    //     })
    // },
    placeOrder: (order, products, totalPrice) => {
        return new Promise((resolve,reject) => {
            console.log(order,products,totalPrice);
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    name: order.name,
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: new ObjectId(order.userId),
                PaymentMethod: order['payment-method'],
                products: products,
                totalAmount: totalPrice,
                status: status,
                date: new Date().toLocaleString()
            }

            db.get().collection(collection.ORDER_COLLECTION)
            .insertOne(orderObj)
            .then((response) => {
                db.get().collection(collection.CART_COLLECTION)
                .deleteOne({ userId: new ObjectId(order.userId)})
                .then((response2)=>{
                    console.log(response2)
                    resolve(response.insertedId)
                })
            })
        })
    },
    findUser: (userId) => {
        return new Promise(async(resolve,reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION)
            .findOne({_id: new ObjectId(userId)})
            resolve(user);
        })
    },
    updateProfileInfo: (userId, user) => {
        return new Promise((resolve, reject) =>{
            console.log("user", userId);
            // let status = user[Userstatus]
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id: new ObjectId(userId)},
            {
                $set:
                {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    // userStatus:status
                }
            }).then((response) => {
                console.log("Profileresponse",response);
                resolve()
            })
        })
    },
    updateAddress: (addressData, userId) => {
        return new Promise((resolve,reject) => {
            addressData._id = new ObjectId();
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id: new ObjectId(userId)},
            {
                $push:
                {
                    address: addressData
                }
            }).then((response) => {
                console.log("uuuuuu", response);
                resolve(response)
            })
            
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async(resolve,reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION)
                .findOne({userId:new ObjectId(userId)})
            console.log(cart);
            if (cart !== null) {
                resolve(cart.products)
            } else {
                reject(new Error('Cart not found for user'))
            }
        })
    },
    
    // getCartProductList: (userId) => {
    //     return new Promise(async(resolve,reject) => {
    //        let cart = await db.get().collection(collection.CART_COLLECTION)
    //        .findOne({user:new ObjectId(userId)})
    //        console.log(cart);
    //        resolve(cart.products)
    //     })
    // }
    getUserOrders: (userId) => {
        return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
            .find({
                userId: new ObjectId(userId)
            }).toArray()
            resolve(orders)
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
    cancelOrder:(orderId) => {
        return new Promise((resolve,reject) => {
            orderId= new ObjectId(orderId)
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
            {
                _id: orderId
            },
            {
                $set: {
                    status: 'cancelled'
                }
            }
            ).then((response) => {
                console.log(response)
                resolve(response);
            })
        })
    },

    // cancelOrder: (orderId) => {
    //     return new Promise(async(resolve, reject) => {
    //         try {
    //             const response = await db.get().collection(collection.ORDER_COLLECTION)
    //                 .updateOne({ _id: new ObjectId(orderId) }, { $set: { status: "Cancelled" } });
    //             if (response.modifiedCount === 0) {
    //                 throw new Error("Failed to cancel order");
    //             }
    //             resolve({ message: "Order cancelled successfully" });
    //         } catch (error) {
    //             reject(error);
    //         }
    //     });
    // },

    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount:total*100,
                currency:"INR",
                receipt:""+orderId
            };
            instance.orders.create(options, function(err,order){
                if(err){
                    console.log(err);
                }else{
                    console.log("New order:",order);   
                    resolve(order) 
                }                          
            });
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'EIOfYjOsCq8l4hFSvebKWHtf');

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if(hmac == details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id: new ObjectId(orderId)},
            {
                $set:{
                    status: 'placed'
                }
            }).then(() => {
                resolve()
            })
        })
    },
    getCartCountNew:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            const cartCount = await db.get().collection(collection.CART_COLLECTION).find({userId: new ObjectId(userId)}).toArray();
            resolve(cartCount[0].products.length);
        })
    },
    wishlistCount:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            const wishlistCount = await db.get().collection(collection.WISHLIST_COLLECTION).find({userId: new ObjectId(userId)}).toArray();
            console.log(wishlistCount[0].products.length);
            resolve(wishlistCount[0].products.length);
        })
    }
}