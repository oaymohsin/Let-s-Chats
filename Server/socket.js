const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("./Models/userModel");
const messageModel= require("./Models/messageModel")

module.exports = (server) => {
  // const io = socketIO(server);
  const io = socketIO(server, {
  
    cors: {
      origin: "http://localhost:4200", // Replace with your Angular application's origin
      methods: ["GET", "POST"], // Add other allowed methods if necessary
    },
  });
  const connectedUsers = {}; // To store socket IDs of connected users

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: Token not provided."));
      }

      const decoded = jwt.verify(token, process.env.JWT_KEY); // Replace with your actual secret key

      const user = await userModel.findById(decoded.userId);

      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }

      // Attach the authenticated user to the socket
      socket.user = user;

      return next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id;
    connectedUsers[userId]=socket.id;
    console.log(connectedUsers)
    try {
      const result = userModel
        .updateOne({ _id: userId }, { online: true })
        .exec();
      console.log(`User ${userId} online status updated successfully`);
      // Handle the success (if needed)
    } catch (err) {
      console.error("Error updating user online status:", err);
      // Handle the error (e.g., send an error response to the client)
    }
    console.log("A user connected:", socket.id, "User:", socket.user);

    socket.on("connectToUser", (targetUserId) => {
      // Store the mapping of targetUserId to socket.id
      // connectedUsers[targetUserId] = socket.id;
      console.log(`User ${socket.user.username} connected to userId ${targetUserId}`);
    });

    socket.on("sendMessageToUser", ({ targetUserId, message }) => {
      console.log(`incoming targetusereid ${targetUserId}`)
      
      const recipientSocketId = connectedUsers[targetUserId];
      console.log(recipientSocketId)
      if (recipientSocketId) {
        // Use io.to(socketId).emit to send a message to a specific socket
        io.to(recipientSocketId).emit("receiveMessageFromUser", {
          sender: socket.user._id,
          receiversocketid:recipientSocketId,
          message: message,
        });
        console.log(`Message sent to user ${targetUserId}`);
      } else {
        //if user is not online then save message to db 
        const messageData=new messageModel({
          sender:socket.user._id,
          receiver:targetUserId,
          content:message,

        })
        messageData.save()
        

        console.log(`User ${targetUserId} is not online.`);
        // Handle offline user scenarios here (e.g., store messages in a database)
      }
    });

    socket.on("disconnect", () => {
      // Handle disconnection and update connectedUsers if needed
      try {
        const result = userModel
          .updateOne({ _id: userId }, { online: false })
          .exec();
          delete connectedUsers[userId]
        console.log(`User ${userId} online status updated successfully`);
        console.log(`Connected Users : ${connectedUsers}`)
        // Handle the success (if needed)
      } catch (err) {
        console.error("Error updating user online status:", err);
        // Handle the error (e.g., send an error response to the client)
      }
      console.log(`User with socket id ${socket.id} disconnected`);
    });
  });
};


