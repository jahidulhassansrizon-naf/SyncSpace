import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { io } from "socket.io-client";
import * as THREE from "three";
import ProjectChat from "./ProjectChat";
import ProjectFiles from "./ProjectFiles";
import Preloader from "./Preloader"; // প্রিলাইডার কম্পোনেন্ট ইম্পোর্ট করা হলো

const socket = io("https://syncspace-ahmd.onrender.com");

const Projects = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  const [onlineUsers, setOnlineUsers] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });

  const [activeChatProject, setActiveChatProject] = useState(null);
  const [activeFileProject, setActiveFileProject] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Three.js Background Animation Effect
  useEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      canvas: currentCanvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.IcosahedronGeometry(1.2, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    const particlesGroup = new THREE.Group();
    const particleCount = 25;
    const particlesArray = [];

    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 90;
      mesh.position.y = (Math.random() - 0.5) * 70;
      mesh.position.z = (Math.random() - 0.5) * 40;

      const scale = Math.random() * 1.5 + 0.5;
      mesh.scale.set(scale, scale, scale);

      particlesGroup.add(mesh);
      particlesArray.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        floatSpeed: Math.random() * 0.02 + 0.01,
      });
    }
    scene.add(particlesGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x059669, 2, 50);
    pointLight.position.set(10, 20, 20);
    scene.add(pointLight);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 3;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 3;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      particlesArray.forEach((item) => {
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
        item.mesh.position.y +=
          Math.sin(Date.now() * 0.002 * item.floatSpeed) * 0.03;
      });

      particlesGroup.rotation.y += (mouseX - particlesGroup.rotation.y) * 0.05;
      particlesGroup.rotation.x += (-mouseY - particlesGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // 3D Card Tilt Event Handlers
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  useEffect(() => {
    if (user && (user._id || user.id)) {
      const currentUserId = user._id || user.id;
      socket.emit("user_online", currentUserId);
    }
  }, [user]);

  useEffect(() => {
    const handleStatusUpdate = ({ userId, isOnline }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: isOnline,
      }));

      setProjects((prevProjects) =>
        prevProjects.map((proj) => {
          const clientId = proj.client?._id || proj.client;
          if (clientId?.toString() === userId?.toString()) {
            return {
              ...proj,
              client:
                typeof proj.client === "object"
                  ? { ...proj.client, isOnline }
                  : proj.client,
            };
          }
          return proj;
        }),
      );
    };

    const handleProjectAdded = (newProject) => {
      setProjects((prev) => {
        const exists = prev.some((p) => p._id === newProject._id);
        if (exists) return prev;
        return [newProject, ...prev];
      });
      socket.emit("join_project", newProject._id);
    };

    const handleProjectModified = (updatedProject) => {
      setProjects((prev) =>
        prev.map((proj) =>
          proj._id === updatedProject._id ? updatedProject : proj,
        ),
      );
    };

    const handleProjectRemoved = (deletedId) => {
      setProjects((prev) => prev.filter((proj) => proj._id !== deletedId));
    };

    const handleWorkflowUnlocked = ({ projectId }) => {
      setProjects((prev) =>
        prev.map((proj) =>
          proj._id === projectId ? { ...proj, workflowUnlocked: true } : proj,
        ),
      );
    };

    const handleProjectAssigned = (assignedProjectId) => {
      const isClientUser = user?.role?.toLowerCase() === "client";
      if (!isClientUser) {
        const currentUserId = user?._id || user?.id;
        setProjects((prev) =>
          prev.filter((proj) => {
            const projId = proj._id?.toString();
            const targetId = assignedProjectId?.toString();
            if (projId === targetId) {
              const assignedFreelancerId =
                proj.freelancer?._id || proj.freelancer;
              if (
                !assignedFreelancerId ||
                assignedFreelancerId.toString() !== currentUserId?.toString()
              ) {
                return false;
              }
            }
            return true;
          }),
        );
      }
    };

    socket.on("update_user_status", handleStatusUpdate);
    socket.on("project_added", handleProjectAdded);
    socket.on("project_modified", handleProjectModified);
    socket.on("project_removed", handleProjectRemoved);
    socket.on("workflow_unlocked", handleWorkflowUnlocked);
    socket.on("project_assigned", handleProjectAssigned);

    return () => {
      socket.off("update_user_status", handleStatusUpdate);
      socket.off("project_added", handleProjectAdded);
      socket.off("project_modified", handleProjectModified);
      socket.off("project_removed", handleProjectRemoved);
      socket.off("workflow_unlocked", handleWorkflowUnlocked);
      socket.off("project_assigned", handleProjectAssigned);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadProjects = async () => {
    try {
      const res = await fetch(
        "https://syncspace-ahmd.onrender.com/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        const projectList = data.projects || data;
        setProjects(projectList);
        projectList.forEach((proj) => {
          socket.emit("join_project", proj._id);
        });
      } else {
        setError(data.message || "Failed to load projects");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      // ডাটা লোড সম্পন্ন হলে প্রিলাইডার বন্ধ করার জন্য একটু ডিলে দিয়ে ফলস করা হলো
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (incomingMsg) => {
      setProjects((prevProjects) =>
        prevProjects.map((proj) => {
          const incomingProjectId = (
            incomingMsg.project?._id ||
            incomingMsg.project ||
            ""
          ).toString();
          const currentProjId = (proj._id || "").toString();

          if (currentProjId === incomingProjectId) {
            const isCurrentChatOpen =
              activeChatProject &&
              (activeChatProject._id || activeChatProject).toString() ===
                currentProjId;

            const isClientUser = user?.role?.toLowerCase() === "client";
            const senderId = (
              incomingMsg.sender?._id ||
              incomingMsg.sender ||
              ""
            ).toString();
            const currentUserId = (user?._id || user?.id || "").toString();

            return {
              ...proj,
              isChatEnabled: true,
              unreadCountClient:
                isClientUser && senderId !== currentUserId && !isCurrentChatOpen
                  ? (proj.unreadCountClient || 0) + 1
                  : proj.unreadCountClient,
              unreadCountFreelancer:
                !isClientUser &&
                senderId !== currentUserId &&
                !isCurrentChatOpen
                  ? (proj.unreadCountFreelancer || 0) + 1
                  : proj.unreadCountFreelancer,
            };
          }
          return proj;
        }),
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [user, activeChatProject]);

  const isClient = user?.role?.toLowerCase() === "client";

  const isUserOnline = (clientObj) => {
    if (!clientObj) return false;
    const userId = clientObj._id || clientObj.id || clientObj;
    const idStr = userId.toString();

    if (onlineUsers[idStr] !== undefined) {
      return onlineUsers[idStr];
    }
    return clientObj.isOnline || false;
  };

  const handleOnDragEnd = async (result) => {
    if (isClient) return;

    const { source, destination, draggableId } = result;
    if (!destination) return;

    const targetProject = projects.find((p) => p._id === draggableId);

    if (!isClient && targetProject && !targetProject.workflowUnlocked) {
      alert(
        "The client has not started and unlocked the workflow yet. You must wait for the client's confirmation in the chat!",
      );
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    setProjects((prevProjects) =>
      prevProjects.map((proj) =>
        proj._id === draggableId ? { ...proj, status: newStatus } : proj,
      ),
    );

    try {
      const res = await fetch(
        `https://syncspace-ahmd.onrender.com/api/projects/${draggableId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!res.ok) {
        loadProjects();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      loadProjects();
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `https://syncspace-ahmd.onrender.com/api/projects/${editProjectId}`
        : "https://syncspace-ahmd.onrender.com/api/projects";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        if (isEditing) {
          socket.emit("project_updated", data);
          setProjects((prev) =>
            prev.map((proj) => (proj._id === data._id ? data : proj)),
          );
        } else {
          socket.emit("project_created", data);
        }

        setShowModal(false);
        setIsEditing(false);
        setEditProjectId(null);
        setFormData({ title: "", description: "", budget: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditModal = (project) => {
    setIsEditing(true);
    setEditProjectId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      budget: project.budget,
    });
    setShowModal(true);
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditProjectId(null);
    setFormData({ title: "", description: "", budget: "" });
    setShowModal(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (isClient) return;

    const targetProject = projects.find((p) => p._id === id);
    if (!isClient && targetProject && !targetProject.workflowUnlocked) {
      alert("You must wait for the client to start the project from the chat!");
      return;
    }

    try {
      const res = await fetch(
        `https://syncspace-ahmd.onrender.com/api/projects/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (res.ok) {
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      const res = await fetch(
        `https://syncspace-ahmd.onrender.com/api/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        socket.emit("project_deleted", id);
        setProjects((prev) => prev.filter((proj) => proj._id !== id));
      } else {
        alert(data.message || "Failed to delete project");
        loadProjects();
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const navLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Tasks", path: "/projects", active: true },
    { name: "Team", path: "/team" },
  ];

  const getUserInitial = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const todoProjects = projects.filter((p) => p.status === "todo");
  const inProgressProjects = projects.filter((p) => p.status === "in-progress");
  const completedProjects = projects.filter((p) => p.status === "completed");

  const isProjectOwner = (project) => {
    if (!user || !project.client) return false;
    const currentUserId = user.id || user._id;
    const projectClientId =
      typeof project.client === "object" ? project.client._id : project.client;
    return currentUserId?.toString() === projectClientId?.toString();
  };

  const renderMessageButton = (project) => {
    const isClientUser = isClient;
    const unreadCount = isClientUser
      ? project.unreadCountClient
      : project.unreadCountFreelancer;

    return (
      <button
        onClick={() => {
          setActiveChatProject(project);
        }}
        className="relative px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 cursor-pointer"
      >
        <span>💬 Message</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className="relative min-h-screen flex flex-col md:flex-row bg-[#f8f7f4] text-stone-800 overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ডাটা লোড হওয়া পর্যন্ত প্রিলাইডার দেখাবে */}
      {loading && <Preloader onLoadingComplete={() => setLoading(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      {/* Three.js Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      ></canvas>

      <div className="md:hidden flex items-center justify-between bg-white px-6 py-4 border-b border-stone-200/60 sticky top-0 z-30 shadow-sm">
        <div className="text-xl font-bold flex items-center gap-2 text-stone-900 tracking-tight">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-black shadow-sm">
            S
          </div>
          SyncSpace
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 md:hidden cursor-pointer"
        ></div>
      )}

      <aside
        className={`fixed md:sticky top-0 min-h-screen w-64 bg-white p-6 flex flex-col justify-between border-r border-stone-200/60 z-50 transition-transform duration-300 ease-in-out shadow-sm ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="hidden md:flex text-2xl font-bold items-center gap-3 mb-10 text-stone-900 tracking-tight">
            <div className="w-10 h-10 bg-stone-900 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-md">
              S
            </div>
            SyncSpace
          </div>
          <nav>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      link.active
                        ? "bg-stone-900 text-white shadow-md"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200/60 space-y-5">
          <div className="flex items-center gap-4 p-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-stone-100 border-2 border-white ring-2 ring-stone-200/50 flex items-center justify-center text-stone-800 font-black text-2xl">
                {getUserInitial()}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isUserOnline(user?._id || user?.id)
                    ? "bg-emerald-500"
                    : "bg-stone-300"
                }`}
              ></span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-base font-bold text-stone-900 truncate">
                {user ? user.name : "Loading..."}
              </p>
              <p className="text-sm text-stone-500 truncate font-medium">
                {user ? user.role : "Member"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-sm font-semibold text-stone-600 hover:text-rose-600 p-3.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative z-20">
        <header className="h-auto md:h-20 bg-white px-6 md:px-8 py-4 md:py-0 flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200/60 gap-4 shadow-xs">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Project Tasks and Workflow
            </h2>
          </div>
          {isClient && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-stone-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-stone-800 transition-all text-sm shadow-sm cursor-pointer"
            >
              Create New Project
            </button>
          )}
        </header>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="p-4 sm:p-6 md:p-8 flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. TO DO */}
            <div className="bg-white/10 border border-white/40 p-5 rounded-3xl shadow-2xl shadow-stone-900/10 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <h3 className="font-bold text-amber-700 tracking-tight">
                  To Do
                </h3>
                <span className="bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full font-bold">
                  {todoProjects.length}
                </span>
              </div>

              <Droppable
                droppableId="todo"
                isDropDisabled={
                  isClient || !projects.some((p) => p.workflowUnlocked)
                }
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-4 flex-1 min-h-[200px] p-1 rounded-2xl ${
                      snapshot.isDraggingOver ? "bg-amber-50/50" : ""
                    }`}
                  >
                    {todoProjects.map((project, index) => {
                      const workflowUnlocked = project.workflowUnlocked;
                      const disableStart = !isClient && !workflowUnlocked;
                      const clientOnline = isUserOnline(project.client);

                      return (
                        <Draggable
                          key={project._id}
                          draggableId={project._id}
                          index={index}
                          isDragDisabled={isClient || !workflowUnlocked}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onMouseMove={handleCardMouseMove}
                              onMouseLeave={handleCardMouseLeave}
                              style={{
                                ...provided.draggableProps.style,
                                transition: "transform 0.1s ease",
                                transformStyle: "preserve-3d",
                              }}
                              className={`bg-white border border-stone-200/80 p-5 rounded-2xl shadow-md relative ${
                                isClient || !workflowUnlocked
                                  ? "cursor-default"
                                  : "cursor-grab"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                      {project.client?.name
                                        ? project.client.name
                                            .charAt(0)
                                            .toUpperCase()
                                        : "C"}
                                    </div>
                                    <span
                                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white ${
                                        clientOnline
                                          ? "bg-emerald-500 animate-pulse"
                                          : "bg-stone-300"
                                      }`}
                                    ></span>
                                  </div>
                                  <span className="text-xs font-bold text-stone-600">
                                    {project.client?.name || "Client"}
                                  </span>
                                </div>
                                {isClient && isProjectOwner(project) && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleOpenEditModal(project)
                                      }
                                      className="text-stone-400 hover:text-stone-900 text-xs font-bold cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProject(project._id)
                                      }
                                      className="text-rose-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                                    >
                                      {project.deleteRequested
                                        ? "Requested..."
                                        : "Delete"}
                                    </button>
                                  </div>
                                )}
                              </div>

                              <h4 className="font-bold text-base text-stone-900 mb-1 tracking-tight">
                                {project.title}
                              </h4>
                              <p className="text-stone-600 text-sm mb-3 line-clamp-2">
                                {project.description}
                              </p>

                              {!isClient && (
                                <p className="text-xs text-stone-400 mb-3">
                                  You can drag and drop
                                </p>
                              )}

                              {project.deleteRequested && (
                                <div className="mb-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-semibold text-center">
                                  ⚠️ Delete request pending approval from
                                  freelancer
                                </div>
                              )}

                              <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-3">
                                <span className="text-emerald-700 font-black text-base tracking-tight">
                                  ${project.budget}
                                </span>
                                <div className="flex gap-2 items-center">
                                  {renderMessageButton(project)}
                                  <button
                                    onClick={() => {}}
                                    disabled={true}
                                    className="px-3 py-1.5 bg-stone-100 text-stone-300 rounded-xl font-bold cursor-not-allowed opacity-50 text-xs"
                                  >
                                    📁 Files
                                  </button>
                                  {!isClient && (
                                    <button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          project._id,
                                          "in-progress",
                                        )
                                      }
                                      disabled={disableStart}
                                      className={`px-3.5 py-1.5 rounded-xl font-bold ${
                                        disableStart
                                          ? "bg-stone-200 text-stone-400 cursor-not-allowed opacity-60"
                                          : "bg-stone-900 text-white cursor-pointer"
                                      }`}
                                    >
                                      Start →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* 2. IN PROGRESS */}
            <div className="bg-white/10 border border-white/40 p-5 rounded-3xl shadow-2xl shadow-stone-900/10 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <h3 className="font-bold text-sky-700 tracking-tight">
                  In Progress
                </h3>
                <span className="bg-sky-50 text-sky-800 text-xs px-3 py-1 rounded-full font-bold">
                  {inProgressProjects.length}
                </span>
              </div>

              <Droppable droppableId="in-progress" isDropDisabled={isClient}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-4 flex-1 min-h-[200px] p-1 rounded-2xl ${
                      snapshot.isDraggingOver ? "bg-sky-50/50" : ""
                    }`}
                  >
                    {inProgressProjects.map((project, index) => {
                      const clientOnline = isUserOnline(project.client);

                      return (
                        <Draggable
                          key={project._id}
                          draggableId={project._id}
                          index={index}
                          isDragDisabled={isClient}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onMouseMove={handleCardMouseMove}
                              onMouseLeave={handleCardMouseLeave}
                              style={{
                                ...provided.draggableProps.style,
                                transition: "transform 0.1s ease",
                                transformStyle: "preserve-3d",
                              }}
                              className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-md relative"
                            >
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                                      {project.client?.name
                                        ? project.client.name
                                            .charAt(0)
                                            .toUpperCase()
                                        : "C"}
                                    </div>
                                    <span
                                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white ${
                                        clientOnline
                                          ? "bg-emerald-500 animate-pulse"
                                          : "bg-stone-300"
                                      }`}
                                    ></span>
                                  </div>
                                  <span className="text-xs font-bold text-stone-600">
                                    {project.client?.name || "Client"}
                                  </span>
                                </div>
                                {isClient && isProjectOwner(project) && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleOpenEditModal(project)
                                      }
                                      className="text-stone-400 hover:text-stone-900 text-xs font-bold cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProject(project._id)
                                      }
                                      className="text-rose-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                                    >
                                      {project.deleteRequested
                                        ? "Requested..."
                                        : "Delete"}
                                    </button>
                                  </div>
                                )}
                              </div>

                              <h4 className="font-bold text-base text-stone-900 mb-1 tracking-tight">
                                {project.title}
                              </h4>
                              <p className="text-stone-600 text-sm mb-3 line-clamp-2">
                                {project.description}
                              </p>

                              {!isClient && (
                                <p className="text-xs text-stone-400 mb-3">
                                  You can drag and drop
                                </p>
                              )}

                              {project.deleteRequested && (
                                <div className="mb-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-semibold text-center">
                                  ⚠️ Delete request pending approval from
                                  freelancer
                                </div>
                              )}

                              <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-3">
                                <span className="text-emerald-700 font-black text-base tracking-tight">
                                  ${project.budget}
                                </span>
                                <div className="flex gap-2 items-center">
                                  {renderMessageButton(project)}
                                  <button
                                    onClick={() => {}}
                                    disabled={true}
                                    className="px-3 py-1.5 bg-stone-100 text-stone-300 rounded-xl font-bold cursor-not-allowed opacity-50 text-xs"
                                  >
                                    📁 Files
                                  </button>
                                  {!isClient && (
                                    <button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          project._id,
                                          "completed",
                                        )
                                      }
                                      className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                                    >
                                      Complete →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* 3. COMPLETED */}
            <div className="bg-white/10 border border-white/40 p-5 rounded-3xl shadow-2xl shadow-stone-900/10 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <h3 className="font-bold text-emerald-700 tracking-tight">
                  Completed
                </h3>
                <span className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
                  {completedProjects.length}
                </span>
              </div>

              <Droppable droppableId="completed" isDropDisabled={isClient}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-4 flex-1 min-h-[200px] p-1 rounded-2xl ${
                      snapshot.isDraggingOver ? "bg-emerald-50/50" : ""
                    }`}
                  >
                    {completedProjects.map((project, index) => {
                      const clientOnline = isUserOnline(project.client);

                      return (
                        <Draggable
                          key={project._id}
                          draggableId={project._id}
                          index={index}
                          isDragDisabled={isClient}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onMouseMove={handleCardMouseMove}
                              onMouseLeave={handleCardMouseLeave}
                              style={{
                                ...provided.draggableProps.style,
                                transition: "transform 0.1s ease",
                                transformStyle: "preserve-3d",
                              }}
                              className="bg-white border border-stone-200/80 p-5 rounded-2xl shadow-md relative"
                            >
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                      {project.client?.name
                                        ? project.client.name
                                            .charAt(0)
                                            .toUpperCase()
                                        : "C"}
                                    </div>
                                    <span
                                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white ${
                                        clientOnline
                                          ? "bg-emerald-500 animate-pulse"
                                          : "bg-stone-300"
                                      }`}
                                    ></span>
                                  </div>
                                  <span className="text-xs font-bold text-stone-600">
                                    {project.client?.name || "Client"}
                                  </span>
                                </div>
                                {isClient && isProjectOwner(project) && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleOpenEditModal(project)
                                      }
                                      className="text-stone-400 hover:text-stone-900 text-xs font-bold cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProject(project._id)
                                      }
                                      className="text-rose-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                                    >
                                      {project.deleteRequested
                                        ? "Requested..."
                                        : "Delete"}
                                    </button>
                                  </div>
                                )}
                              </div>

                              <h4 className="font-bold text-base text-stone-500 line-through mb-1 tracking-tight">
                                {project.title}
                              </h4>
                              <p className="text-stone-400 text-sm mb-3 line-clamp-2">
                                {project.description}
                              </p>

                              {!isClient && (
                                <p className="text-xs text-stone-400 mb-3">
                                  You can drag and drop
                                </p>
                              )}

                              {project.deleteRequested && (
                                <div className="mb-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-semibold text-center">
                                  ⚠️ Delete request pending approval from
                                  freelancer
                                </div>
                              )}

                              <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-3">
                                <span className="text-emerald-700 font-black text-base tracking-tight">
                                  ${project.budget}
                                </span>
                                <div className="flex gap-2 items-center">
                                  {renderMessageButton(project)}
                                  <button
                                    onClick={() =>
                                      setActiveFileProject(project)
                                    }
                                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white rounded-xl font-bold transition-all cursor-pointer text-xs"
                                  >
                                    📁 Files
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </main>

      {activeFileProject && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl rounded-3xl relative overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveFileProject(null)}
              className="absolute top-6 right-6 z-20 text-stone-400 hover:text-stone-900 font-bold text-xs cursor-pointer w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            <ProjectFiles
              project={activeFileProject}
              currentUser={user}
              onProjectUpdate={(updatedProj) => {
                setProjects((prev) =>
                  prev.map((p) =>
                    p._id === updatedProj._id ? updatedProj : p,
                  ),
                );
                setActiveFileProject(updatedProj);
              }}
            />
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-200/60 w-full max-w-md p-8 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-bold text-stone-900 mb-6 tracking-tight">
              {isEditing ? "Edit Project" : "Create New Project"}
            </h3>
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#f8f7f4] border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#f8f7f4] border border-stone-200 rounded-xl"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Budget ($)
                </label>
                <input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#f8f7f4] border border-stone-200 rounded-xl"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-stone-100 text-stone-700 font-bold py-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-stone-900 text-white font-bold py-3 rounded-xl cursor-pointer"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeChatProject && (
        <ProjectChat
          projectId={activeChatProject._id}
          projectTitle={activeChatProject.title}
          currentUser={user}
          onClose={() => {
            setActiveChatProject(null);
            loadProjects();
          }}
          onWorkflowUnlocked={(unlocked) => {
            setProjects((prev) =>
              prev.map((p) =>
                p._id === activeChatProject._id
                  ? { ...p, workflowUnlocked: unlocked }
                  : p,
              ),
            );
          }}
        />
      )}
    </div>
  );
};

export default Projects;
