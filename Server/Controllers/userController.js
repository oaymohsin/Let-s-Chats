const bcrypt = require("bcrypt");
const userModel = require("../Models/userModel");
const groupModel= require("../Models/groupModel")
const jwt = require("jsonwebtoken");
const { response } = require("../app");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new userModel({
      username: req.body.username,
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "user created",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({

          error: err.message,
        });
      });
  });
};

exports.loginUser = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        message: "Authenticaaaation failed",
      });
    }

    const result = await bcrypt.compare(req.body.password, user.password);

    if (!result) {
      console.log(result);
      return res.status(401).json({
        message: "Authentication failed",
      });
    }

    // Continue with the rest of the code...
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token: token,
      expiresIn: 3600,
      userId: user._id,
    });
  } catch (err) {
    console.error("Login error:", err);

    // Handle specific errors
    if (err.name === "MongoError" && err.code === 18) {
      return res.status(401).json({
        message: "Authentication failed",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getUsers = async(req, res,next)=>{
  try {
    const users=await userModel.find()
    // console.log(users)
    if(users){
      res.status(200).json({
        message:"data fetched Successfully",
        result:users
      })
    }
  } catch (error) {
    res.status(500).json({
      message:error.message
    })
  }
}

