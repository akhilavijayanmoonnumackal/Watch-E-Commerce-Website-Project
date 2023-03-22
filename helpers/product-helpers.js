const db=require('../config/connection');
const collection=require('../config/collections');
const { response } = require('../app');
const ObjectId=require('mongodb-legacy').ObjectId;

module.exports={
    viewProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION)
            .find().toArray();
            resolve(products);
        })
    },

    addProduct:(product,callback)=>{
        db.get().collection(collection.PRODUCT_COLLECTION)
        .insertOne(product).then((data)=>{
            callback(data.insertedId);
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .findOne({_id: new ObjectId(proId)}).then((product)=>{
                resolve(product);
            })
        })
    },
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
    }
}