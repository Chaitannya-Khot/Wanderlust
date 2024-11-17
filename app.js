const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")

MONGOURL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
    .then(() => {
        console.log("connected to db");
    }) .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGOURL);
}

app.get("/", (req, res) => {
    res.send("root api is working")
});

app.get("/listings", wrapAsync(async (req, res) => {
    let allListings = await listing.find({});
    res.render("listings/index.ejs", ({allListings}));
}));

//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//specified route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/show.ejs", {Listing});
}));

//create route
app.post("/listings", wrapAsync(async (req, res, next) => {
        let newListing = new listing(req.body.listing);
        if(!req.body.listing) {
            throw new ExpressError(400, "Send Valid data for listing");
        };
        await newListing.save();
        res.redirect("/listings");
 })
);

 //edit route
 app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
    try {
        let {id} = req.params;
        const Listing = await listing.findById(id);
        res.render("listings/edit.ejs", {Listing});
    } catch(err) {
        next(err);
    };
 }));

//update route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


// app.get("/testlisting", async (req, res) => {
//     let sampleListing = new listing({
//         title: "new villa",
//         description: "by the beach",
//         price: 1200,
//         locaiton: "calangute goa",
//         country: "india"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesfull");
// })

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong!"} = err;
    res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("working");
});