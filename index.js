const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");

MONGOURL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("views engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

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

app.get("/listings", async (req, res) => {
    let allListings = await listing.find({});
    res.render("listings/index.ejs", ({allListings}));
});

//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//specified route
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/show.ejs", {Listing});
})

//main route
app.post("/listings", async (req, res) => {
    let newListing = new listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
 })

 //edit route
 app.get("/listings/:id/edit", async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/edit.ejs", {Listing});
 });

//update route
app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
});

app.delete("/listings/:id", async (req, res) => {
    let {id} = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});


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

app.listen(8080, () => {
    console.log("working");
});