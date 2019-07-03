exports.isUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Please log in.');
        res.redirect('/users/login');
    }
}

exports.isAdmin = function(req, res, next) {
    if (req.isAuthenticated() && res.locals.user.admin == 1) {
        next();
    } else {
        req.flash('danger', 'Please log in as admin.');
        res.redirect('/users/login');
    }
}


module.exports.whoBuy= function (req,res,next) {
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'You must login first to do this!!! ' );
        res.redirect('back')
    }


}