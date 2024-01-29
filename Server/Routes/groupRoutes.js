const express=require('express')
const groupController=require('../Controllers/groupController')
const router=express.Router()

router.post('/createGroup',groupController.createGroup)

module.exports=router