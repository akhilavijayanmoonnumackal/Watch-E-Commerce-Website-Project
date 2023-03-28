
module.exports = {

    checkforUser : (req, res,next) =>{
        if(req.session.loggedIn){
            res.redirect('/')
        }
        else{
            next()
        }
    },
    checkforAdmin : (req,res,next)=>{
        if(req.session.admin){
            res.redirect('/admin')
        }
        else{
            next()
        }
    }
}