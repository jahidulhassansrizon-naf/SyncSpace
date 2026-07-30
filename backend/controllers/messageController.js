const Message = require("../models/Message");
const Project = require("../models/Project");

exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role?.toLowerCase();

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    if (userRole === "client" && !project.isChatEnabled) {
      return res.status(403).json({
        message:
          "Chat is disabled until the assigned freelancer starts the conversation.",
      });
    }

    const isMember =
      project.client?.toString() === userId.toString() ||
      project.freelancer?.toString() === userId.toString() ||
      (!project.freelancer && userRole === "freelancer");

    if (!isMember) {
      return res.status(403).json({
        message:
          "Access Denied: You are not a member of this project workspace.",
      });
    }

    const messages = await Message.find({ project: projectId })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err.message);
    res.status(500).send("Server Error");
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { projectId, text } = req.body;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role?.toLowerCase();

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    if (userRole === "client" && !project.isChatEnabled) {
      return res.status(403).json({
        message:
          "You cannot send messages yet. Waiting for the freelancer to initiate.",
      });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;
    const fileType = req.file ? req.file.mimetype : null;

    const newMessage = new Message({
      project: projectId,
      sender: userId,
      text: text || "",
      fileUrl,
      fileName,
      fileType,
    });

    const savedMessage = await newMessage.save();

    project.isChatEnabled = true;

    if (userRole === "freelancer" && !project.freelancer) {
      project.freelancer = userId;
    }

    const senderId = savedMessage.sender.toString();
    const clientStrId = project.client.toString();

    if (senderId === clientStrId) {
      project.unreadCountFreelancer = (project.unreadCountFreelancer || 0) + 1;
    } else {
      project.unreadCountClient = (project.unreadCountClient || 0) + 1;
    }

    await project.save();

    const populatedMessage = await Message.findById(savedMessage._id).populate(
      "sender",
      "name email role",
    );

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Send Message Error:", err.message);
    res.status(500).send("Server Error");
  }
};
