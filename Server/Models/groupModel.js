const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
  groupName: { type: String, required: true },
  createdBy: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admins:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
  timeStamp: { type: Date, default: Date.now },
});

const Groups = mongoose.model("Groups", groupSchema);

module.exports = Groups;
