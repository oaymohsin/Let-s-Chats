const mongoose= require("mongoose")

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  });
  
  const Message = mongoose.model('Message', messageSchema);
  
  module.exports = Message;