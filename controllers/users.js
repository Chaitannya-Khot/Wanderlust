const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signUp = async (req, res) => {
    try {
        let {  email, username, password } = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", `${username} has been Registered.`);
            res.redirect("/listings");
        });
         
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }   
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.authenticateLogin = async (req, res) => {
    req.flash("success", "welcome to wanderlust, Thanks for visiting again");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logOut = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been Logged out.");
        res.redirect("/listings");
    })
};