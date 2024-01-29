const express=require("express")

const messageController=require("../Controllers/messagesController")
const router=express.Router()
const app=express()


router.get("/getMessages/:id",messageController.fetchUndeliveredMessage)
router.delete("/deleteSeenMessage/:id",messageController.deleteMessageAfterSeen)

module.exports = router;