const Listing = require("../models/listing.js");
const geocode = require("../utils/geocode.js");

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", ({ allListings }));
}
//NEW
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

//SHOW
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })


        .populate("owner");
    if (!listing) {
        req.flash("error", "This listing doesnt exists!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

//CREATE
module.exports.createListing = async (req, res, next) => {
    console.log(req.file); // Logs the file data
    console.log(req.body); // Logs the body data

    if (req.file) {

        //geocode part
        const coords = await geocode(req.body.listing.location);
        if (!coords) {
            req.flash("error", "Unable to geocode the location");
            return res.redirect("/listings/new");
        }

        // Get the file URL and filename from the Cloudinary storage
        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing({
            ...req.body.listing, // Extract other fields from req.body
            location: req.body.listing.location,
            geometry: {
                type: 'Point',
                coordinates: [coords.lng, coords.lat],
            },
            image: { url, filename } // Add the image data
        });

        newListing.owner = req.user._id; // Set the owner
        await newListing.save();

        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    } else {
        req.flash("error", "No image uploaded!");
        res.redirect("/listings/new");
    }
};

//update
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    const coords = await geocode(req.body.listing.location);
    if (!coords || isNaN(coords.lat) || isNaN(coords.lng)) {
        req.flash("error", "Unable to geocode the location.");
        return res.redirect("/listings/new");
    }

    req.body.listing.price = parseFloat(req.body.listing.price);
    let listing = await Listing
        .findByIdAndUpdate(id, {
            ...req.body.listing,
            geometry: {
                type: 'Point',
                coordinates: [coords.lng, coords.lat],
            },
        });

        console.log(listing);

    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", `listing "${listing.title}" has been updated`);
    res.redirect(`/listings/${id}`);
};

//edit
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "This listing doesnt exists!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

//DELETE
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
