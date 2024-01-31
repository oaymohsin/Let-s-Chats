const groupModel = require("../Models/groupModel");

const Socket=require('../socket')
const {connectedUsers}=require('../Middleware/connectedUsers')


exports.createGroup = async (req, res, next) => {
  try {
    const groupData = new groupModel({
      groupName: req.body.groupName,
      createdBy: req.body.createdBy,
      members: req.body.members,
    });
    await groupData.save().then((data) => {
      
      console.log(`connected user object from socket.js ${connectedUsers['65abf445b4dcd0bd0f31d11b']}`)
      console.log(`data members ${data.members}`)
      
      data.members.forEach(element => {
        if(connectedUsers[element]){
          const memberSocketId=connectedUsers[element];
          console.log(`for this element ${element} it socket id is ${memberSocketId}`)
          console.log(data._id)
          
            Socket.to(memberSocketId).emit('joinGroup', data._id);
            console.log("'joinGroup' event emitted successfully");
         
         

        }
      });
      res.status(201).json({
        message: "Group Created Successfully",
        data: data,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      result: false,
    });
  }
};

exports.getAllGroups = async (req, res, next) => {
  try {
    await groupModel.find().then((groups) => {
      res.status(201).json({
        result: true,
        data: groups,
      });
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
};

