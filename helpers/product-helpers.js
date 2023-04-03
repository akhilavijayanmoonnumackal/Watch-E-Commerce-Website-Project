const db=require('../config/connection');
const collection=require('../config/collections');
const { response } = require('../app');
const { productDetail } = require('../controllers/user-controller');
const { reject } = require('bcrypt/promises');
const ObjectId=require('mongodb-legacy').ObjectId;

module.exports={
    viewProducts:() => {
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION)
            .find().toArray();
            resolve(products);
        })
    },
    addProduct:(product,callback)=>{
        product.price = parseInt(product.price);
        product.category = new ObjectId(product.category);
        product.status =true;
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .insertOne(product).then((data)=>{
                callback(data.insertedId);
                resolve(data);
            })
        })        
    },
    // addProduct:(product,callback)=>{
    //     db.get().collection(collection.PRODUCT_COLLECTION)
    //     .insertOne(product).then((data)=>{
    //         callback(data.insertedId);
    //     })
    // },
    // getProductDetails:(proId)=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.PRODUCT_COLLECTION)
    //         .findOne({_id: new ObjectId(proId)}).then((product)=>{
    //             resolve(product);
    //         })
    //         .catch((response)=>{
    //             console.log(response)
    //             reject()
    //         })
    //     })
    // },

    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .findOne({_id: new ObjectId(proId)}).then((product)=>{
                resolve(product);
            })
            .catch((response)=>{
                console.log(response)
                reject()
            })
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
    
    addProductImages:(proId,imgUrl) => {
        return new Promise(async(resolve,reject) => {
            console.log(imgUrl);
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id: new ObjectId(proId)}, 
            { $set: 
                {
                    image:imgUrl
                }
            }).then((data) => {
                resolve(data);
            })
        })
    },
    updateProduct: (proId,proDetail) => {
        return new Promise((resolve,reject) => {
            console.log(proId)
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id: new ObjectId(proId)},
            {
                $set:
                {
                    name:proDetail.name,
                    description:proDetail.description,
                    price:proDetail.price,
                    category:proDetail.category
                }
            }).then((response) => {
                console.log(response);
                resolve()
            })
        })
    },
    updateProductImages: (proId,imgUrl) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id: new ObjectId(proId)},
            {
                $set: 
                {
                    image:imgUrl
                }
            })
            .then((response)=>{
                console.log(response);
                resolve();
            })
            .catch((err)=>{
                console.log(err);
            })
        })
    },
    listProduct: (proId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id: new ObjectId(proId)},
            {
                $set:
                {
                    status:true
                }
            }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },
    unlistProduct: (proId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id: new ObjectId(proId)},
            {
                $set:
                {
                    status:false
                }
            }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    }
}