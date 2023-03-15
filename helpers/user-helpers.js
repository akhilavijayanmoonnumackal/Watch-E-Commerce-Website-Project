var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const ObjectId=require('mongodb-legacy').ObjectId;
const collections = require('../config/collections');
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
            const isCart = await db.get().collection(collections.CART_COLLECTION).findOne({userId:userId});
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
                    db.get().collection(collections.CART_COLLECTION)
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
                    db.get().collection(collections.CART_COLLECTION)
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
                db.get().collection(collections.CART_COLLECTION)
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
            const cartDetails = await db.get().collection(collections.CART_COLLECTION).aggregate([
              {
                $match: { userId: userId }
              },
              {
                $lookup: {
                  from: collections.PRODUCT_COLLECTION,
                  localField: "products.productId",
                  foreignField: "_id",
                  as: "productDetails"
                }
              },
              {
                $project: {
                  _id: 0,
                  userId: 1,
                  products: {
                    $map: {
                      input: "$products",
                      as: "product",
                      in: {
                        $mergeObjects: [
                          "$$product",
                          {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$productDetails",
                                  as: "productDetail",
                                  cond: {
                                    $eq: ["$$productDetail._id", "$$product.productId"]
                                  }
                                }
                              },
                              0
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              }
            ]).toArray();
            resolve(cartDetails[0].products);
          } catch (error) {
            reject(error);
          }
        });
      },
    getCartCount: (userId) => {
        return new Promise(async (resolve,reject) => {
            let count = 0
            let cart = await db.get().collection(collections.CART_COLLECTION)
            .findOne({ user: ObjectId(userId) })
            if(cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
     changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve,reject) => {
            if(details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id: ObjectId(details.cart) },
                {
                    $pull: { products: { item: ObjectId(details.product) } }
                }
                ).then((response) => {
                    resolve({ removeProduct: true })
                }) 
            } else {
                db.get().collection(collections.CART_COLLECTION)
                .updateOne({_id: ObjectId(details.cart), 'products.item' : ObjectId(details.product) },
                {
                    $inc: { 'products.$.quantity' : details.count }
                }
                ).then((response) => {
                    resolve({status:true})
                })
            }
        })
    },
    removeProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION)
            .updateOne({_id: ObjectId(details.cart) },
            {
                $pull: { products: { item: ObjectId(details.product) } }
            }
            ).then(() => {
                resolve()
            })
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collections.CART_COLLECTION)
            .aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $group: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } }
                    }
                }
            ]).toArray()
            console.log(total[0].total);
            resolve(total[0].total)
        })
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
    }
}