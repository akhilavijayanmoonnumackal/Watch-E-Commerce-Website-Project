const db=require('../config/connection');
const collection=require('../config/collections');
const { response } = require('../app');
const { productDetail } = require('../controllers/user-controller');
const { reject } = require('bcrypt/promises');
const async = require('hbs/lib/async');
// const { default: orders } = require('razorpay/dist/types/orders');
const ObjectId=require('mongodb-legacy').ObjectId;

module.exports = {

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
        proDetail.price = parseInt(proDetail.price);
        proDetail.category = new ObjectId(proDetail.category);
        proDetail.status =true;
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
    },
    getOrderedProducts: (orderId) => {
        return new Promise(async(resolve,reject) => {
            try {
                orderId = new ObjectId(orderId);
                let orderedItems = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                      '$match': {
                        _id: orderId
                      }
                    }, {
                      '$unwind': {
                        'path': '$products'
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
                  ]).toArray()
                  console.log("orderedItems",orderedItems);
                  resolve(orderedItems)
            } catch{
                resolve(null)
            }
        })
    },
    getAllSales: () => {
        return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
                {
                  '$match': {
                    'status': 'delivered'
                  }
                }, 
                {
                  '$lookup': {
                    'from': 'user', 
                    'localField': 'userId', 
                    'foreignField': '_id', 
                    'as': 'userDetails'
                  }
                }
              ]).toArray()
              console.log("orders",orders);
              resolve(orders)
        })
    },
    search: (details) => {
        return new Promise(async(resolve, reject) => {
          try {
            const searchValue = details.search;
            const products = await db.get().collection(collection.PRODUCT_COLLECTION)
              .find({
                'name': { $regex: `.*${searchValue}.*`, $options: 'i' } 
              }).toArray();
            resolve(products);
          } catch (err) {
            reject(err);
          }            
        })
    }
}