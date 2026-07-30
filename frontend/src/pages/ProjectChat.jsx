import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ProjectChat = ({
  projectId,
  projectTitle,
  currentUser,
  onClose,
  onWorkflowUnlocked,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // 🚀 কাস্টম মডাল ও টোস্ট (Toast) এর জন্য নতুন স্টেটসমূহ
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null); // { message: "", type: "success" | "error" }

  const [projectData, setProjectData] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  const currentUserId = (currentUser?._id || currentUser?.id || "").toString();
  const isFreelancer = currentUser?.role?.toLowerCase() === "freelancer";
  const isClient = currentUser?.role?.toLowerCase() === "client";

  // 🚀 টোস্ট মেসেজ দেখানোর ফাংশন
  const showToastMessage = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // ৩ সেকেন্ড পর অটোমেটিক চলে যাবে
  };

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const currentProj = data.find((p) => p._id === projectId);
          if (currentProj) setProjectData(currentProj);
        }
      } catch (err) {
        console.error("Failed to fetch project details", err);
      }
    };

    fetchProjectDetails();
  }, [projectId, token]);

  useEffect(() => {
    if (!projectId) return;

    const clearUnreadCount = async () => {
      try {
        await fetch(
          `http://localhost:5000/api/projects/${projectId}/clear-unread`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch (err) {
        console.error("Failed to clear unread count", err);
      }
    };

    clearUnreadCount();
  }, [projectId, token]);

  useEffect(() => {
    if (!projectId) return;

    socket.emit("join_project", projectId);

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/messages/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (res.ok) {
          setMessages(data);
          setErrorMessage(null);
        } else {
          setErrorMessage(data.message || "Access denied.");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setErrorMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const handleReceiveMessage = (incomingMsg) => {
      if (incomingMsg.project === projectId) {
        setMessages((prev) => [...prev, incomingMsg]);

        fetch(`http://localhost:5000/api/projects/${projectId}/clear-unread`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => console.error(err));
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [projectId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const fullUrl = `http://localhost:5000${fileUrl}`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || fileUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(`http://localhost:5000${fileUrl}`, "_blank");
    }
  };

  // 🚀 আনলক নিশ্চিত করার ফাংশন
  const confirmUnlockWorkflow = async () => {
    setShowUnlockConfirm(false);
    
    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/unlock`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setProjectData(data.project);
        socket.emit("workflow_unlocked", { projectId });
        if (onWorkflowUnlocked) onWorkflowUnlocked(true);
        showToastMessage("Project successfully started!", "success"); // 🚀 কাস্টম সাকসেস মেসেজ
      } else {
        showToastMessage(data.message || "Failed to unlock workflow.", "error");
      }
    } catch (err) {
      console.error("Error unlocking workflow:", err);
      showToastMessage("Server error", "error");
    }
  };

  // 🚀 ডিলিট নিশ্চিত করার ফাংশন
  const confirmAllowDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/allow-delete`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (res.ok) {
        socket.emit("project_deleted", projectId);
        showToastMessage("Project deleted successfully.", "success");
        setTimeout(() => onClose(), 1500); // মেসেজ দেখার পর চ্যাটবক্স বন্ধ হবে
      } else {
        showToastMessage(data.message || "Failed to delete project.", "error");
      }
    } catch (err) {
      console.error("Error allowing delete:", err);
      showToastMessage("Server error", "error");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("text", newMessage);
      if (selectedFile) formData.append("file", selectedFile);

      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const savedMessage = await res.json();

      if (res.ok) {
        socket.emit("send_message", savedMessage);
        setNewMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        showToastMessage(savedMessage.message || "Failed to send message.", "error");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <>
      {/* 🚀 Custom Toast Notification */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-top-5 duration-300">
          <div
            className={`px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span className="text-sm font-bold tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 sm:right-7 w-[92vw] sm:w-[390px] h-[560px] max-h-[85vh] bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 flex flex-col border border-stone-200/90 overflow-hidden font-sans transition-all duration-300">
        {/* Header */}
        <div className="p-4 px-5 border-b border-stone-100 bg-white/80 backdrop-blur-sm flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-stone-900 to-stone-700 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm leading-snug truncate max-w-[170px] tracking-tight">
                {projectTitle || "Project Discussion"}
              </h3>
              <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1.5 mt-0.5 tracking-tight">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Workspace Chat
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100/80 rounded-xl transition-all cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Workflow Status Bar */}
        {projectData && (
          <div className="bg-stone-50 border-b border-stone-200/60 p-2.5 px-4 flex items-center justify-between gap-2 shrink-0">
            <div className="text-[11px] font-semibold text-stone-700">
              {projectData.workflowUnlocked ? (
                <span className="text-emerald-700 font-bold">
                  Workflow Status: Unlocked & Active
                </span>
              ) : (
                <span className="text-amber-700 font-bold">
                  Workflow Status: Locked
                </span>
              )}
            </div>

            {isClient && !projectData.workflowUnlocked && (
              <button
                onClick={() => setShowUnlockConfirm(true)}
                className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-xs cursor-pointer shrink-0"
              >
                Start Project
              </button>
            )}
          </div>
        )}

        {/* Delete Request Notification */}
        {projectData?.deleteRequested && (
          <div className="bg-rose-50/90 backdrop-blur-xs border-b border-rose-200/80 p-2.5 px-4 flex items-center justify-between gap-2 shrink-0">
            <div className="text-[11px] text-rose-800 font-semibold">
              {isFreelancer
                ? "Client has requested to delete this project."
                : "Delete request is pending approval."}
            </div>
            {isFreelancer && (
              <button
                onClick={() => setShowDeleteConfirm(true)} // 🚀 কাস্টম মডাল খুলবে
                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                Approve
              </button>
            )}
          </div>
        )}

        {/* Messages List Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#faf9f6] space-y-3.5 scrollbar-thin">
          {loading ? (
            <div className="text-center text-stone-400 text-xs py-12 font-medium animate-pulse">
              Loading conversation...
            </div>
          ) : errorMessage ? (
            <div className="text-center text-rose-500 text-xs py-8 font-semibold bg-rose-50 rounded-2xl border border-rose-100 p-3">
              {errorMessage}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-stone-400 text-xs py-20 font-medium">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = (msg.sender?._id || msg.sender || "").toString();
              const isMe = senderId === currentUserId;

              const senderName = msg.sender?.name || "User";
              const senderRole = msg.sender?.role || "Member";

              return (
                <div
                  key={msg._id || Math.random()}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} w-full`}
                >
                  {!isMe && (
                    <span className="text-[10px] font-bold text-stone-500 mb-1 ml-1 flex items-center gap-1.5 tracking-tight">
                      {senderName}
                      <span className="bg-stone-200/70 text-stone-700 text-[8px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider">
                        {senderRole}
                      </span>
                    </span>
                  )}

                  <div
                    className={`flex items-end gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isMe && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-stone-800 to-stone-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs mb-0.5 border border-stone-300/40">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`p-3 px-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs transition-all ${
                        isMe
                          ? "bg-gradient-to-tr from-stone-900 to-stone-800 text-stone-100 rounded-br-xs shadow-stone-900/10"
                          : "bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs shadow-stone-200/50"
                      }`}
                    >
                      {msg.fileUrl && (
                        <div className="mb-2">
                          {msg.fileType?.startsWith("image/") ||
                          msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                            <div className="relative group">
                              <img
                                src={`http://localhost:5000${msg.fileUrl}`}
                                alt="attachment"
                                onClick={() =>
                                  setPreviewImage(
                                    `http://localhost:5000${msg.fileUrl}`,
                                  )
                                }
                                className="max-w-full h-auto rounded-xl max-h-44 object-cover border border-stone-700/20 cursor-pointer hover:opacity-90 transition-opacity shadow-xs"
                              />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(msg.fileUrl, msg.fileName)
                              }
                              className={`flex items-center gap-2 p-2 rounded-xl text-[11px] border transition-all cursor-pointer ${
                                isMe
                                  ? "bg-stone-800/90 text-stone-200 border-stone-700 hover:bg-stone-700"
                                  : "bg-stone-100/80 text-stone-800 border-stone-200 hover:bg-stone-200"
                              }`}
                            >
                              {msg.fileName || "Download Attachment"}
                            </button>
                          )}
                        </div>
                      )}

                      {msg.text && (
                        <p className="whitespace-pre-wrap font-medium tracking-tight">
                          {msg.text}
                        </p>
                      )}

                      <span
                        className={`text-[8px] block mt-1 text-right font-medium tracking-tight ${
                          isMe ? "text-stone-400" : "text-stone-400"
                        }`}
                      >
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedFile && (
          <div className="px-4 py-2 bg-stone-100/80 border-t border-stone-200 flex items-center justify-between text-xs text-stone-700 font-medium shrink-0 backdrop-blur-xs">
            <span className="truncate max-w-[220px] font-mono text-[11px]">
              {selectedFile.name}
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-rose-600 font-bold hover:underline cursor-pointer text-xs"
            >
              Remove
            </button>
          </div>
        )}

        {/* Bottom Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className={`p-3 px-3.5 bg-white/90 border-t border-stone-200/80 flex items-center gap-2 shrink-0 ${
            errorMessage ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all cursor-pointer shrink-0"
            title="Attach File"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-stone-100/70 border border-stone-200/80 rounded-2xl px-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white transition-all font-normal placeholder:text-stone-400"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() && !selectedFile}
            className="bg-stone-900 hover:bg-stone-800 active:scale-95 disabled:opacity-30 text-white p-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white p-4 rounded-3xl max-w-lg w-full relative shadow-2xl border border-stone-200">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 bg-stone-100 hover:bg-stone-200 text-stone-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              >
                ✕
              </button>
              <h3 className="text-xs font-bold text-stone-900 mb-3 tracking-tight">
                Image Preview
              </h3>
              <div className="flex justify-center bg-stone-50 rounded-2xl p-2 max-h-[50vh] overflow-hidden border border-stone-200/80">
                <img
                  src={previewImage}
                  alt="Chat Preview"
                  className="max-h-[45vh] object-contain rounded-xl"
                />
              </div>
              <div className="mt-3.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const path = previewImage.replace(
                      "http://localhost:5000",
                      "",
                    );
                    handleDownload(path);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Download Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 Custom Unlock Confirmation Modal */}
      {showUnlockConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white p-6 rounded-2xl max-w-[320px] w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-stone-900 mb-2">
              Unlock Workspace?
            </h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              By confirming, you will grant the freelancer access to start working on this project. Have you finished discussing all the details?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUnlockConfirm(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnlockWorkflow}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Yes, Start Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white p-6 rounded-2xl max-w-[320px] w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-rose-600 mb-2">
              Approve Deletion?
            </h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              Are you sure you want to approve this project deletion request? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAllowDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectChat;