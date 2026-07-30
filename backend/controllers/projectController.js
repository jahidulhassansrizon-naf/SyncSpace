const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Project = require("../models/Project");

// ১. প্রজেক্ট তৈরি করার ফাংশন[cite: 2]
exports.createProject = async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() === "freelancer") {
      return res.status(403).json({
        message: "Access Denied: Only clients can create projects.",
      });
    }

    const { title, description, budget, freelancer } = req.body;

    const project = new Project({
      title,
      description,
      budget,
      client: req.user.id || req.user._id,
      freelancer: freelancer || null,
      status: "todo",
      workflowUnlocked: false, // ডিফল্ট ফলস থাকবে[cite: 2]
    });

    await project.save();

    const populatedProject = await Project.findById(project._id).populate(
      "client freelancer",
      "name email role isOnline",
    );

    res.status(201).json(populatedProject);
  } catch (err) {
    console.error("Create Project Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ২. ইউজারের প্রজেক্ট লিস্ট ফেচ করার ফাংশন (প্যাগিনেশন ও লিমিট সহ অপ্টিমাইজড)[cite: 2]
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // পেজিনেশনের জন্য পেজ এবং লিমিট নির্ধারণ (ডিফল্ট: পেজ ১, লিমিট ১০)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { client: userId },
        { freelancer: userId },
        { freelancer: null },
        { freelancer: { $exists: false } },
      ],
    };

    // মোট প্রজেক্ট সংখ্যা বের করা
    const totalProjects = await Project.countDocuments(query);

    // লিমিট ও স্কিপ ব্যবহার করে নির্দিষ্ট সংখ্যক প্রজেক্ট আনা
    const projects = await Project.find(query)
      .populate("client freelancer", "name email role isOnline")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      projects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: page,
      totalProjects,
    });
  } catch (err) {
    console.error("Get Projects Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ৩. প্রজেক্ট স্ট্যাটাস আপডেট করার ফাংশন[cite: 2]
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userRole = req.user.role?.toLowerCase();

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    if (userRole === "client") {
      return res.status(403).json({
        message:
          "Access Denied: Clients cannot change project status. Only the assigned freelancer can update workflow status.",
      });
    }

    // 🚀 ব্যাকএন্ড সিকিউরিটি চেক: ক্লায়েন্ট ওয়ার্কফ্লো আনলক না করলে ফ্রিল্যান্সার স্ট্যাটাস বদলাতে পারবে না[cite: 2]
    if (!project.workflowUnlocked) {
      return res.status(400).json({
        message: "Workflow is not unlocked by the client yet.",
      });
    }

    project.status = status;
    await project.save();

    const updatedProject = await Project.findById(project._id).populate(
      "client freelancer",
      "name email role isOnline",
    );

    res.json(updatedProject);
  } catch (err) {
    console.error("Update Status Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// 🚀 ৩.১ প্রজেক্ট ওয়ার্কফ্লো আনলক বা স্টার্ট করার ফাংশন (ক্লায়েন্টের জন্য)[cite: 2]
exports.unlockWorkflow = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== "client") {
      return res.status(403).json({
        message: "Access Denied: Only clients can unlock the workflow.",
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    project.workflowUnlocked = true;
    await project.save();

    const updatedProject = await Project.findById(project._id).populate(
      "client freelancer",
      "name email role isOnline",
    );

    res.status(200).json({ success: true, project: updatedProject });
  } catch (err) {
    console.error("Unlock Workflow Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ৪. প্রজেক্ট ডিলিট করার ফাংশন[cite: 2]
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    const userId = req.user.id || req.user._id;
    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "Access Denied: Only the project creator can delete this project.",
      });
    }

    if (project.isChatEnabled && project.freelancer) {
      if (!project.deleteRequested) {
        project.deleteRequested = true;
        await project.save();
        return res.status(400).json({
          message:
            "Delete request sent to the freelancer. Once the freelancer allows, you can delete it.",
          deleteRequested: true,
        });
      }

      return res.status(400).json({
        message:
          "Delete request is already pending with the freelancer. Please wait for approval.",
        deleteRequested: true,
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete Project Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ৪.১ ফ্রিল্যান্সার কর্তৃক ডিলিট পারমিশন দিয়ে প্রজেক্ট রিমুভ করার ফাংশন[cite: 2]
exports.allowDeleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    const userId = req.user.id || req.user._id;
    if (project.freelancer?.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "Access Denied: Only the assigned freelancer can approve delete.",
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({
      message: "Project deleted successfully by freelancer permission.",
    });
  } catch (err) {
    console.error("Allow Delete Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ৫. প্রজেক্টের বিস্তারিত এডিট করার ফাংশন[cite: 2]
exports.updateProjectDetails = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    const userId = req.user.id || req.user._id;
    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "Access Denied: Only the project creator can edit this project.",
      });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.budget = budget !== undefined ? budget : project.budget;

    await project.save();

    const updatedProject = await Project.findById(project._id).populate(
      "client freelancer",
      "name email role isOnline",
    );

    res.json(updatedProject);
  } catch (err) {
    console.error("Update Details Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ৬. ড্যাশবোর্ড ওভারভিউ ও অ্যানালিটিক্স[cite: 2]
exports.getDashboardStats = async (req, res) => {
  try {
    const rawUserId = req.user.id || req.user._id;
    const userId = new mongoose.Types.ObjectId(rawUserId);

    const breakdown = await Project.aggregate([
      {
        $match: {
          $or: [{ client: userId }, { freelancer: userId }],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalBudget: { $sum: "$budget" },
        },
      },
    ]);

    const summaryData = await Project.aggregate([
      {
        $match: {
          $or: [{ client: userId }, { freelancer: userId }],
        },
      },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalBudget: { $sum: "$budget" },
        },
      },
    ]);

    const summary = summaryData[0] || { totalProjects: 0, totalBudget: 0 };

    res.status(200).json({
      summary: {
        totalProjects: summary.totalProjects,
        totalBudget: summary.totalBudget,
      },
      breakdown: breakdown,
    });
  } catch (err) {
    console.error("Aggregation error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ৭. চ্যাট ওপেন হলে আনরিড কাউন্ট ক্লিয়ার করার ফাংশন[cite: 2]
exports.clearUnreadCount = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userRole = req.user.role?.toLowerCase();

    const updateField =
      userRole === "client"
        ? { unreadCountClient: 0 }
        : { unreadCountFreelancer: 0 };

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: updateField },
      { new: true },
    ).populate("client freelancer", "name email role isOnline");

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found!" });
    }

    res.status(200).json({ success: true, project: updatedProject });
  } catch (err) {
    console.error("Clear Unread Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ৮. সিক্রেট কোড সহ প্রজেক্ট ফাইল আপলোড করার ফাংশন[cite: 2]
exports.uploadProjectFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const projectId = req.params.id;
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;
    const { secretCode } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        projectFile: {
          fileUrl,
          fileName,
          uploadedAt: new Date(),
          secretCode: secretCode || "",
        },
      },
      { new: true },
    ).populate("client freelancer", "name email role isOnline");

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res
      .status(200)
      .json({ message: "File uploaded successfully", updatedProject });
  } catch (err) {
    console.error("Upload Project File Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ৯. পেমেন্ট স্ট্যাটাস[cite: 2]
exports.updatePaymentStatus = async (req, res) => {
  return res.status(200).json({ message: "Payment option is disabled." });
};

// ১০. সিক্রেট কোড ভেরিফাই করে ফাইল ডাউনলোড করার ফাংশন[cite: 2]
exports.downloadProjectFile = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.projectFile || !project.projectFile.fileUrl) {
      return res
        .status(404)
        .json({ message: "No file uploaded for this project yet." });
    }

    const userCode = req.query.code;

    if (!userCode || userCode !== project.projectFile.secretCode) {
      return res
        .status(403)
        .json({ message: "❌ Invalid Secret Code! Access Denied." });
    }

    res.status(200).json({
      fileUrl: project.projectFile.fileUrl,
      fileName: project.projectFile.fileName,
    });
  } catch (err) {
    console.error("Download Project File Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// ১১. প্রজেক্ট ফাইল সম্পূর্ণ ডিলিট করার ফাংশন[cite: 2]
exports.deleteProjectFile = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.projectFile && project.projectFile.fileUrl) {
      const filePath = path.join(__dirname, "..", project.projectFile.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      project.projectFile = undefined;
      await project.save();
    }

    const updatedProject = await Project.findById(project._id).populate(
      "client freelancer",
      "name email role isOnline",
    );

    res.status(200).json({
      message: "File deleted successfully from server and database",
      updatedProject,
    });
  } catch (err) {
    console.error("Delete Project File Error:", err.message);
    res.status(500).send("Server Error");
  }
};
