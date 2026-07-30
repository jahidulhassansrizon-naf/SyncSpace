const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const dns = require("dns");
const path = require("path");

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected Mama!"))
  .catch((err) => console.log("Database Connection Error:", err));

const User = require("./models/User");
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ User Connected to Chat: ${socket.id}`);

  socket.on("user_online", async (userId) => {
    if (userId) {
      socket.userId = userId;
      activeUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("update_user_status", { userId, isOnline: true });
    }
  });

  socket.on("join_project", (projectId) => {
    socket.join(projectId);
  });

  socket.on("send_message", (data) => {
    io.to(data.project).emit("receive_message", data);
  });

  socket.on("project_created", (newProject) => {
    io.emit("project_added", newProject);
  });

  socket.on("project_updated", (updatedProject) => {
    io.emit("project_modified", updatedProject);
  });

  socket.on("project_deleted", (projectId) => {
    io.emit("project_removed", projectId);
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      if (activeUsers.get(socket.userId) === socket.id) {
        activeUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        io.emit("update_user_status", {
          userId: socket.userId,
          isOnline: false,
        });
      }
    }
  });
});

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("SyncSpace API is running perfectly...");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});
