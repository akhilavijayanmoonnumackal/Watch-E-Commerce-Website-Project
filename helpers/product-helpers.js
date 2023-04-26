const db=require('../config/connection');
const collection=require('../config/collections');
const { response } = require('../app');
const { productDetail } = require('../controllers/user-controller');
const { reject } = require('bcrypt/promises');
const async = require('hbs/lib/async');
// const { default: orders } = require('razorpay/dist/types/orders');
const ObjectId=require('mongodb-legacy').ObjectId;

module.exports = {

    viewProducts:(currentPage) => {
        const page = parseInt(currentPage);
        const limit = 8
        const skip = (page - 1) * limit;

        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION)
            .find() .limit(limit)
            .skip(skip)
            .toArray();
            resolve(products);
        })
    },
    addProduct:(product,callback)=>{
        product.stock = parseInt(product.stock);
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
        proDetail.stock = parseInt(proDetail.stock);;
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
                    stock:proDetail.stock,
                    price:proDetail.price,
                    category:proDetail.category
                }
            }).then((response) => {
                console.log(response);
                console.log("responseeeeeeeeeeeeeeeeeeeeeee",response);
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
    getOrderDetails:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
          let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id: new ObjectId(orderId)})
          console.log('MEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
          try{
            console.log(orderDetails);
            resolve(orderDetails)
          }catch(err){
            resolve(0)
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
    },
    // getFilteredPro: async(filter) => {
    //     if(filter === 'high') {
    //         filter = -1;
    //     }else{
    //         filter = 1;
    //     }
    //     let products = await db.get().collection(collection.PRODUCT_COLLECTION)
    //     .find({status: true}).sort({price: filter}).toArray();
    //     return products;
    // }
    getFilteredPro: async(filter) => {
        if(filter === 'high') {
            filter = -1;
        }else if(filter === '₹0.00 - ₹5000.00'){
            let products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({status: true, price: {$gte: 0, $lte: 5000}}).toArray();
                return products;
        }else if(filter === '₹5000.00 - ₹25000.00'){
            let products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({status: true, price: {$gte: 5000, $lte: 25000}}).toArray();
                return products;
        }else if(filter === '₹25000.00 - ₹50000.00'){
            let products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({status: true, price: {$gte: 25000, $lte: 50000}}).toArray();
                return products;
        }else if(filter === 'above50000'){
            let products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({status: true, price: {$gte: 50000}}).toArray();
                return products;
        }else{
            filter = 1;
        }
        let products = await db.get().collection(collection.PRODUCT_COLLECTION)
        .find({status: true}).sort({price: filter}).toArray();
        return products;
    },
    decreamentStock:(proDetails) => {
        return new Promise(async(resolve,reject) => {
            try {
                for(let i=0;i<proDetails.length;i++){
                    await db.get().collection(collection.PRODUCT_COLLECTION)
                    .updateOne(
                        {
                            _id: proDetails[i].productId
                        },
                        {
                            $inc: {
                                "stock": -proDetails[i].quantity
                            }
                        }
                    )
                }
                resolve();
            }
            catch{
                resolve();
            }
        })
    },
    totalOrdersDelivered:() => {
        return new Promise(async(resolve,reject) => {
            try{
                const orderDeliveredCount = await db.get().collection(collection.ORDER_COLLECTION)
                .countDocuments();
                resolve(orderDeliveredCount);
            }catch{
                resolve(0);
            }
        })
    }
}