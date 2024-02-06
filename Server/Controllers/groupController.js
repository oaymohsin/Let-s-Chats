const groupModel = require("../Models/groupModel");

const Socket=require('../socket')
const {connectedUsers}=require('../Middleware/connectedUsers')

const io= Socket()

exports.createGroup = async (req, res, next) => {
  try {
    const groupData = new groupModel({
      groupName: req.body.groupName,
      createdBy: req.body.createdBy,
      members: req.body.members,
    });
    await groupData.save().then(async (data) => {
      
      // console.log(`connected user object from socket.js ${connectedUsers['65abf445b4dcd0bd0f31d11b']}`)
      // console.log(`data members ${data.members}`)
      const populatedGroup = await groupModel.populate(data, { path: 'members' });


      data.members.forEach(element => {
        if(connectedUsers[element]){
          const memberSocketId=connectedUsers[element];
          // console.log(`for this element ${element} it socket id is ${memberSocketId}`)
          // console.log(data._id)
          
            // io.to(memberSocketId).emit('joinGroup', data._id);
            // console.log("'joinGroup' event emitted successfully");
         
         

        }
      });
      res.status(201).json({
        message: "Group Created Successfully",
        data: populatedGroup
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

exports.getGroupsById = async (req, res, next) => {
  try {
    const id = req.params.id;
    // we use $in if we want to search in the array of mongodb object 
    groupModel.find({ members: { $in: [id] } })
      .then(async data => {
        const populatedGroup = await groupModel.populate(data, { path: 'members' });
        if (data.length > 0) {
          res.status(200).json({
            data: populatedGroup,
            result: true
          });
        } else {
          res.status(404).json({
            message: "This user has no groups",
            data: null,
            result: false
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          message: "Internal Server Error",
          data: null,
          result: false,
          error: error.message
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      data: null,
      result: false
    });
  }
};

exports.deleteGroup= async (req,res,next)=>{
  try {
    const groupId= req.params.id;
    await groupModel.deleteOne({ _id: groupId }).then((result) => {
      // console.log(result)
      if (result.deletedCount > 0) {
        res.status(200).json({ 
          message: "Deleted successfully!",
          result:true
      
      });
      } else {
        res.status(401).json({ message: "Not deleted",
        result:false });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      result:false
    })
  }
}


