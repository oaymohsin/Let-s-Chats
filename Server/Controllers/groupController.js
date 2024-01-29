const groupModel = require("../Models/groupModel");

exports.createGroup = async (req, res, next) => {
  try {
    const groupData = new groupModel({
      groupName: req.body.groupName,
      createdBy: req.body.createdBy,
      members: req.body.members,
    });
    await groupData.save().then((data) => {
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

