const express = require("express");
const groupController = require("../Controllers/groupController");
const router = express.Router();

router.post("/createGroup", groupController.createGroup);

router.get("/getGroupsById/:id", groupController.getGroupsById);

router.get("/fetchGroupMembers/:id", groupController.fetchGroupMembers);

router.get("/fetchGroupsById/:id", groupController.getGroupByGroupId);
router.delete("/deleteGroup/:id", groupController.deleteGroup);

router.post("/makeGroupAdmin", groupController.makeGroupAdmin);

router.post("/removeGroupAdmin", groupController.removeGroupAdmin);

router.post("/leaveGroup", groupController.leaveGroup);

module.exports = router;
