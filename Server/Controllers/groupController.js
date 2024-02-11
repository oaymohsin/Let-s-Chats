const groupModel = require("../Models/groupModel");

const Socket = require("../socket");
const { connectedUsers } = require("../Middleware/connectedUsers");

const io = Socket();

exports.createGroup = async (req, res, next) => {
  try {
    const groupData = new groupModel({
      groupName: req.body.groupName,
      createdBy: req.body.createdBy,
      members: req.body.members,
      admins: req.body.createdBy,
    });
    await groupData.save().then(async (data) => {
      // console.log(`connected user object from socket.js ${connectedUsers['65abf445b4dcd0bd0f31d11b']}`)
      // console.log(`data members ${data.members}`)
      const populatedGroup = await groupModel.populate(data, [
        { path: "admins" },
        { path: "members" },
      ]);

      data.members.forEach((element) => {
        if (connectedUsers[element]) {
          const memberSocketId = connectedUsers[element];
          // console.log(`for this element ${element} it socket id is ${memberSocketId}`)
          // console.log(data._id)

          // io.to(memberSocketId).emit('joinGroup', data._id);
          // console.log("'joinGroup' event emitted successfully");
        }
      });
      res.status(201).json({
        message: "Group Created Successfully",
        data: populatedGroup,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      result: false,
    });
  }
};

exports.makeGroupAdmin = async (req, res, next) => {
  try {
    const memberId = req.body.memberId;
    const groupId = req.body.groupId;

    const result = await groupModel.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { admins: memberId } }
    );

    if (result) {
      res.status(200).json({
        message: "Added successfully!",
        result: true,
      });
    } else {
      res.status(200).json({
        message: "Member is already an admin.",
        result: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      result: false,
    });
  }
};

exports.removeGroupAdmin = async (req, res, next) => {
  try {
    const memberId = req.body.memberId;
    const groupId = req.body.groupId;

    const result = await groupModel.findOneAndUpdate(
      { _id: groupId },
      { $pull: { admins: memberId } }
    );

    if (result) {
      res.status(200).json({
        message: "Removed successfully!",
        result: true,
      });
    } else {
      res.status(400).json({
        message: "Member is not an admin.",
        result: false,
      });
    }
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
    groupModel
      .find({ members: { $in: [id] } })
      .then(async (data) => {
        const populatedGroup = await groupModel.populate(data, {
          path: "members",
        });
        if (data.length > 0) {
          res.status(200).json({
            data: populatedGroup,
            result: true,
          });
        } else {
          res.status(404).json({
            message: "This user has no groups",
            data: null,
            result: false,
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Internal Server Error",
          data: null,
          result: false,
          error: error.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      data: null,
      result: false,
    });
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    await groupModel.deleteOne({ _id: groupId }).then((result) => {
      // console.log(result)
      if (result.deletedCount > 0) {
        res.status(200).json({
          message: "Deleted successfully!",
          result: true,
        });
      } else {
        res.status(401).json({ message: "Not deleted", result: false });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      result: false,
    });
  }
};

exports.leaveGroup = async (req, res, next) => {
  try {
    const groupId = req.body.groupId;
    const memberId = req.body.memberId;

    const group = await groupModel.findOne({ _id: groupId });

    //If no group found against the given groupId
    if (!group) {
      return res.status(400).json({ message: "No group found", result: false });
    }

    let memberToMakeAdmin = null;
    // console.log(group.admins.length);
    // console.log(group.createdBy);
    if (
      group.admins.length < 2 &&
      group.admins.includes(memberId) &&
      group.createdBy == memberId && group.members.length > 1
    ) {
      //If group has only one group admin then make another member admin
      memberToMakeAdmin = group.members.filter(
        (member) => member != memberId
      )[0];
      console.log("Existing Admins:", group.admins);
      console.log("Existing Members:", group.members);

      const result = await groupModel.findOneAndUpdate(
        { _id: groupId },
        { $pull: { admins: memberId, members: memberId } },
        { new: true }
      );

      if (!result) {
        return res.status(400).json({
          message: "No group found or update failed",
          result: false,
        });
      }

      // Now update the 'admins' field with $set
      result.admins = [memberToMakeAdmin];
      const updatedGroup = await result.save();

      console.log(updatedGroup);

      return res.status(200).json({
        message: `Member left the group, and ${memberToMakeAdmin} is set as admin`,
        result: true,
      });
    }

    // if group have only one member and only single admin
    if (
      group.admins.length < 2 &&
      group.admins.includes(memberId) &&
      group.createdBy == memberId &&
      group.members.length <= 1
    ) {
      //If group has only one group admin then make another member admin
      // memberToMakeAdmin = group.members.filter(
      //   (member) => member != memberId
      // )[0];
      // console.log("Existing Admins:", group.admins);
      // console.log("Existing Members:", group.members);

      const result = await groupModel.findOneAndUpdate(
        { _id: groupId },
        { $pull: { admins: memberId, members: memberId } },
        { new: true }
      );

      const deleteGroup= await groupModel.deleteOne({_id:groupId})


      if (deleteGroup.deletedCount<0) {
        return res.status(400).json({
          message: "No group found or update failed",
          result: false,
        });
      }

      // Now update the 'admins' field with $set
      // result.admins = [memberToMakeAdmin];
      // const updatedGroup = await result.save();

      // console.log(updatedGroup);

      return res.status(200).json({
        message: `This group had only one member and that member left the group `,
        result: true,
      });
    }


    if (
      group.admins.length >= 2 &&
      group.admins.includes(memberId) &&
      group.createdBy !== memberId
    ) {
      const result = await groupModel.findOneAndUpdate(
        { _id: groupId },
        { $pull: { admins: memberId, members: memberId } }
      );

      return res.status(200).json({
        message: `Member left the group and also left the adminship`,
        result: true,
      });
    } else {
      
      const result = await groupModel.findOneAndUpdate(
        { _id: groupId },
        { $pull: { members: memberId } }
      );

      return res.status(200).json({
        message: `Member left the group`,
        result: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      result: false,
    });
  }
};
