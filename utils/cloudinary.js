// const cloud_name = 'dbyo5cli1';
// const api_key = '425891553314847';
// const api_secret = 'B1J_00btWyCmjxmrryTTPkDpsLg';
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = cloudinary;