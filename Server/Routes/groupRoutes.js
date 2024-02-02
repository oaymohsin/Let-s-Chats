const express=require('express')
const groupController=require('../Controllers/groupController')
const router=express.Router()

router.post('/createGroup',groupController.createGroup)

router.get('/getGroupsById/:id',groupController.getGroupsById)


module.exports=router