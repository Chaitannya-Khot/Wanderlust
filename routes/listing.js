const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const listing = require("../models/listing.js");
//middleware file
const {isLoggedIn} = require("../middleware.js")

//validating with joi
//listing validation.
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
    throw new ExpressError(400, error);
 } else {
    next();
}};

router.get("/", wrapAsync(async (req, res) => {
    let allListings = await listing.find({});
    res.render("listings/index.ejs", ({allListings}));
}));

//NEW route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//SHOW route
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id).populate("reviews");
        if(!Listing) {
            req.flash("error", "This listing doesnt exists!");
            return res.redirect("/listings");
        }
        res.render("listings/show.ejs", {Listing});
    })
);

//CREATE route
router.post("/",  isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
        console.log(req.body);
        let newListing = new listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
 })
);

 //edit route
 router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const Listing = await listing.findById(id);
    if(!Listing) {
        req.flash("error", "This listing doesnt exists!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { Listing });
}));


//update route
router.put("/:id", isLoggedIn, validateListing, wrapAsync (async (req, res) => {
    let {id} = req.params;
    req.body.listing.price = parseFloat(req.body.listing.price);
    let {title} = await listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", `listing "${title}" has been updated`);
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;