const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const userRoutes = require("./Routes/userRoutes");
const messageRoutes=require("./Routes/messageRoutes")

const app = express();
app.use(cors());

const MONGO_URI =
  "mongodb+srv://mohsinmaken3:" +
  process.env.MONGO_ATLAS_PW +
  "@cluster0.epwsfar.mongodb.net/LetsChat";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    // console.log(process.env.MONGO_ATLAS_PW)

    console.log("conncected successfully");
  })
  .catch(() => {
    console.log("connection failed");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/messages",messageRoutes)

module.exports = app;
