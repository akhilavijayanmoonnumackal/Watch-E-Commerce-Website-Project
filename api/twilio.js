const accountSid ='AC96e560a732bc215c3cc5ef66b4e9e8f7'
const authToken ='4e6a79f45986c38e6b86a871814c8d98'
const serviceSid ='VA218ea587d1416b936118cbbf7aed37f5'
const client = require('twilio')(accountSid, authToken);
require('dotenv')

module.exports = { 
    sendOtp : (mobile) =>{
        return new Promise((resolve, reject) =>{
            client.verify.v2.services(serviceSid)
            .verifications
            .create({to:`+91${mobile}`, channel: 'sms'})
            .then(verification => {
                console.log(verification.status)
                resolve(verification.status)
            });
        })
    },

    verifyOtp : (mobile, otp) =>{
        return new Promise((resolve, reject) =>{
            client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({to: `+91${mobile}`, code: `${otp}`})
            .then(verification_check => {
                console.log(verification_check.status)
              
                    resolve(verification_check.status);                
            });
        })
    }

}