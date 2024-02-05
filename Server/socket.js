const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("./Models/userModel");
const messageModel = require("./Models/messageModel");
const groupModel = require("./Models/groupModel");

const connectedUsers = {};

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: Token not provided."));
      }

      const decoded = jwt.verify(token, process.env.JWT_KEY);

      const user = await userModel.findById(decoded.userId);

      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }

      socket.user = user;

      return next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id;
    connectedUsers[userId] = socket.id;

    try {
      const result = userModel
        .updateOne({ _id: userId }, { online: true })
        .exec();
      console.log(`User ${userId} online status updated successfully`);
    } catch (err) {
      console.error("Error updating user online status:", err);
    }

    console.log("A user connected:", socket.id, "User:", socket.user);

    socket.on("connectToUser", (targetUserId) => {
      console.log(`User ${socket.user.username} connected to userId ${targetUserId}`);
    });

    socket.on("sendMessageToUser", ({ targetUserId, message }) => {
      console.log(`incoming targetUserId ${targetUserId}`);

      const recipientSocketId = connectedUsers[targetUserId];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessageFromUser", {
          sender: socket.user._id,
          receiversocketid: recipientSocketId,
          message: message,
        });
        console.log(`Message sent to user ${targetUserId}`);
      } else {
        const messageData = new messageModel({
          sender: socket.user._id,
          receiver: targetUserId,
          content: message,
        });
        messageData.save();
        console.log(`User ${targetUserId} is not online.`);
      }
    });

    socket.on('getGroups', (data, callback) => {
      const membersSocketIds = [];
      const groupMembers = [...data.groupMembers];

      groupMembers.forEach(element => {
        if (connectedUsers[element._id]) {
          const memberSocketId = connectedUsers[element._id];
          membersSocketIds.push(memberSocketId);
          io.to(memberSocketId).emit('joinGroup', data.groupId);
          console.log(`User socket ${memberSocketId} id fetched`);
        }
      });

      callback(membersSocketIds);
    });

    socket.on('joinGroup', (data) => {
      const targetSocketId = data.targetSocketId;
      const groupId = data.groupId;

      io.to(targetSocketId).emit('joinGroup', groupId);
      console.log(`User ${targetSocketId} joined group ${groupId}`);
    });

    socket.on('sendMessageToGroup', async (data) => {
      const groupId = data.groupId;
      const message = data.message;

      const group = await groupModel.findById(groupId);
      const groupMembers = group.members;

      groupMembers.forEach((member) => {
        if (connectedUsers[member]) {
          const memberSocketId = connectedUsers[member];
          io.to(memberSocketId).emit('receiveMessageFromGroup', {
            sender: socket.user.username,
            groupId:groupId,
            message: message,
          });
          console.log(`Message sent to group member ${member}` );
        }else {
            // Handle unauthorized attempts to send messages
            console.log(`Unauthorized attempt to send message in group ${groupId}`);
          }
      });

      // // Check if the sender is a member of the group
      // if (socket.groupMembers && socket.groupMembers[socket.user._id]) {
      //   // Broadcast the message to all members in the group
      //   io.to(groupId).emit('receiveMessageFromGroup', {
      //     sender: socket.user._id,
      //     message: message,
      //   });
      // } 
    });

    socket.on("disconnect", () => {
      try {
        const result = userModel
          .updateOne({ _id: userId }, { online: false })
          .exec();
        delete connectedUsers[userId];
        console.log(`User ${userId} online status updated successfully`);
        console.log(`Connected Users : ${connectedUsers}`);
      } catch (err) {
        console.error("Error updating user online status:", err);
      }
      console.log(`User with socket id ${socket.id} disconnected`);
    });
  });

  return io;
};
