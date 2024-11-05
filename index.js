const express = require("express");
const app = express();
const mongoose = require("mongoose");

app.set("view engine", "ejs");


app.listen(8080, () => {
    console.log("working");
});