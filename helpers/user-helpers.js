const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
var ObjectId=require('mongodb-legacy').ObjectId;
const collections = require('../config/collections');
const { response } = require('express');
//const { use } = require('../routes/user')

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
                console.log(proExist);
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
            console.log(cartItems.length);
            resolve(cartItems);
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
    // removeCartProduct: (details) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.CART_COLLECTION)
    //         .updateOne({_id:new ObjectId(details.cart) },
    //         {
    //             $pull: { products: { item:new ObjectId(details.product) } }
    //         }
    //         ).then((response) => {
    //             resolve(removeProduct=true)
    //         })
    //     })
    // },
    // getTotalAmount: (userId) => {
    //     return new Promise(async(resolve,reject)=>{
    //         let total = await db.get().collection(collection.CART_COLLECTION)
    //         .aggregate([
    //             {
    //                 '$match': { 'userId': userId }
    //             },
    //             {
    //                 '$unwind': '$products'
    //             },
    //             {
    //                 '$project': {
    //                     'item': '$products.productId',
    //                     'quantity': '$products.quantity'
    //                 }
    //             },
    //             {
    //                 '$lookup': {
    //                     'from': collection.PRODUCT_COLLECTION,
    //                     'localField': 'products.productId',
    //                     'foreignField': '_id',
    //                     'as': 'productDetails'
    //                 }
    //             },
    //             {
    //                 '$project': {
    //                     'item': 1, quantity: 1, 'product': { '$arrayElemAt': ['$product', 0] }
    //                 }
    //             },
    //             {
    //                 '$group': {
    //                     '_id': null,
    //                     'total': { '$sum': { '$multiply': ['$quantity', { '$toInt': '$product.price' }] } }
    //                 }
    //             }
    //         ]).toArray();
    //         try {
    //             console.log(total[0].total);
    //             resolve(total[0].total)
    //         }catch {
    //             resolve(null)
    //         }            
    //     })
    // },
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
              console.log("total",total[0].total)
              //console.log(cartItems.length);
              resolve(total[0].total);
            } catch(err) {
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
            let result = await db.get().collection(collections.WISHLIST_COLLECTION)
            .aggregate(
                [
                    {
                      '$match': {
                        'userId': new ObjectId(userId)
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
                        '_id': 0
                      }
                    }
                ]
            ).toArray();
            console.log(result[0].productDetails);
            resolve(result[0].productDetails)
        })
    },
    addToWishlist:(userId, productId)=>{
        return new Promise(async(resolve, reject)=>{
            userId = new ObjectId(userId);
            productId = new ObjectId(productId);
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
    // placeOrder: (order, products, total) => {
    //     return new Promise((resolve,reject) => {
    //         console.log(order,products,total);
    //         let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
    //         let orderObj = {
    //             deliveryDetails: {
    //                 mobile: order.mobile,
    //                 address: order.address,
    //                 pincode: order.pincode
    //             },
    //             userId: ObjectId(order.userId),
    //             PaymentMethod: order['payment-method'],
    //             products: products,
    //             totalAmount: total,
    //             status: status,
    //             date: new Date()
    //         }
    //         db.get().collection(collection.ORDER_COLLECTION)
    //         .insertOne(orderObj).then((response) => {
    //             db.
    //         })
    //     })
    // },
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
                resolve(response)
            })
            
        })
    }
}