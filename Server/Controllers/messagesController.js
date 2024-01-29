const messageModel=require("../Models/messageModel")

exports.fetchUndeliveredMessage = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const messages = await messageModel.find({ receiver: userId });

        if (!messages || messages.length === 0) {
            return res.status(200).json({
                result: "No messages for this user",
            });
        }

        res.status(200).json({
            result: messages,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error",
            result: false,
        });
    }
};

exports.deleteMessageAfterSeen=async (req,res, next)=>{
    try {
        const userId = req.params.id;

        const messages = await messageModel.findOne({ _id: userId });

        if (!messages || messages.length === 0) {
            return res.status(200).json({
                result: "No messages against given id",
            });
        }
        messageModel.deleteOne({ _id: messages._id}).then((result) => {
            // console.log(result)
            if (result.deletedCount > 0) {
              res.status(200).json({ message: "Deleted successfully!" });
            } else {
              res.status(401).json({ message: "Not deleted" });
            }
          });

        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error",
            result: false,
        });
    }

}