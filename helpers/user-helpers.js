var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
//const { use } = require('../routes/user')

module.exports={
    doSignUp:(userData)=>{
        //console.log(userData);
        return new Promise(async(resolve, reject)=>{
            userData.password=await bcrypt.hash(userData.password,10);
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
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        response.status=true;
                        if(user.userStatus){
                            response.user=user;
                            resolve(response);
                        }else{
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
    }
}