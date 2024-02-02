const express = require("express");

const userController = require("../Controllers/userController");

const router = express.Router();
const app = express();

router.post("/signup", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/getUsers",userController.getUsers);



// router.post("/login", userController.loginUser);

module.exports = router;
