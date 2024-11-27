module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        //redirect Url
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be Logged in to create a Listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};