const mongoose = require("mongoose");

const groupMessageSchema = mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Groups" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  message: { type: String, required: true },
  timesteamp: { type: Date, default: Date.now },
});

const groupMessages = mongoose.model("groupMessages", groupMessageSchema);

module.exports = groupMessages;
