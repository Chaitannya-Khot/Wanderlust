const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
//middleware file
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")


router.get("/", wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", ({allListings}));
}));

//NEW route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//SHOW route
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",
         populate: {path: "author"}})
    .populate("owner");
        if(!listing) {
            req.flash("error", "This listing doesnt exists!");
            return res.redirect("/listings");
        }
        res.render("listings/show.ejs", {listing});
    })
);

//CREATE route
router.post("/",  isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res, next) => {
        console.log(req.body);
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
 })
);

 //edit route
 router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "This listing doesnt exists!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));


//update route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync (async (req, res) => {
    let {id} = req.params;
    req.body.listing.price = parseFloat(req.body.listing.price);
    let {title} = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", `listing "${title}" has been updated`);
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));


module.exports = router;