var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const ObjectId=require('mongodb-legacy').ObjectId;
const { response } = require('express')
const { CART_COLLECTION } = require('../config/collections')
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
    addToCart:(proId,userId)=>{
        let proObj={
            item:ObjectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION)
            .findOne({user:ObjectId(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=>product.item==proId)
                console.log(proExist);
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:ObjectId(userId), 'products.item':ObjectId(proId)},
                        {
                            $inc:{'products.$.quantity':1}
                        }
                    ).then(()=>{
                        resolve()
                    })                   
                }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:ObjectId(userId)},
                    {
                        $push:{products:proObj}
                    }
                    ).then((response)=>{
                        resolve()
                    })
                }
            }else{
                let cartObj={
                    user:ObjectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION)
                insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(userId) => {
        return new Promise(async(resolve,reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION)
            .aggregate([
                {
                    $match: { user : new ObjectId(userId) }
                },
                {
                    $unwind : '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity:'$products.quantity'
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
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve,reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION)
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
                db.get().collection(collection.CART_COLLECTION)
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
            db.get().collection(collection.CART_COLLECTION)
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
            let total = await db.get().collection(collection.CART_COLLECTION)
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
            let result = await db.get().collection(collection.WISHLIST_COLLECTION)
            .aggregate([
                {
                    $match:{ user: ObjectId(userId)}
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(result)
        })
    }
}