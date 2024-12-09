if(process.env.NODE_ENV != "production") {
require('dotenv').config();
};
const express = require("express");
//express
const app = express();
const path = require("path");
//mongoose/custom errors
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError.js");
//methodov/ejsmate-modulation
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//router
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
//expressSession/req.flash
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
//passportAuthentification
const passport = require("passport");
const LocalStrategy = require("passport-local");
//middleware file
const {isLoggedIn} = require("./middleware.js");
//mongooseModels/db
const dbUrl = process.env.ATLASDB_URL;
const User = require("./models/user.js");
MONGOURL = "mongodb://127.0.0.1:27017/wanderlust";

//mongoose boilerplate
main()
    .then(() => {
        console.log("connected to db");
    }) .catch((err) => {
        console.log(err);
    });

    async function main() {
    await mongoose.connect(dbUrl);
}



//view engine
app.set("view engine", "ejs");
app.engine('ejs', ejsMate);
//defining paths
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
//body parsing
app.use(express.urlencoded({extended: true}));
//CRUD methods for forms
app.use(methodOverride("_method"));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 60 * 60 * 24,
});

store.on("error", () => {
    console.log("Error in mongo store", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

//express session default code
app.use(session(sessionOptions));
app.use(flash());

//passport deafult code
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//routes
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong!"} = err;
    // res.status(statusCode).send(message);
    //rendering error page instead of basic error res.send.status
    res.status(statusCode).render("error.ejs", {err});
    
});

app.listen(8080, () => {
    console.log("working");
});