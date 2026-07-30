import React, { useState } from "react";

const ProjectFiles = ({ project, currentUser, onProjectUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [secretCode, setSecretCode] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ইনলাইন ট্রান্সফর্মেশনের জন্য স্টেটস (ক্লায়েন্টের জন্য)
  const [isEnteringCode, setIsEnteringCode] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [codeError, setCodeError] = useState("");

  const token = localStorage.getItem("token");
  const isFreelancer = currentUser?.role?.toLowerCase() === "freelancer";

  // ফাইল সিলেক্ট হ্যান্ডলার
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // ফাইল আপলোড করার ফাংশন
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file first!");
    if (!secretCode.trim())
      return alert("Please enter a Secret Code for the client!");

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("secretCode", secretCode);

      const res = await fetch(
        `http://localhost:5000/api/projects/${project._id}/upload-file`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const data = await res.json();
      if (res.ok) {
        alert("File uploaded successfully with Secret Code!");
        setSelectedFile(null);
        setSecretCode("");
        if (onProjectUpdate) onProjectUpdate(data.updatedProject);
      } else {
        alert(data.message || "Failed to upload file.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Server error during upload.");
    } finally {
      setUploading(false);
    }
  };

  // ফ্রিল্যান্সারের ফাইল ডিলিট করার ফাংশন
  const handleDeleteFile = async () => {
    if (
      !window.confirm("Are you sure you want to delete this delivery file?")
    ) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(
        `http://localhost:5000/api/projects/${project._id}/delete-file`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (res.ok) {
        alert("File deleted successfully!");
        if (onProjectUpdate) onProjectUpdate(data.updatedProject);
      } else {
        alert(data.message || "Failed to delete file.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error during file deletion.");
    } finally {
      setDeleting(false);
    }
  };

  // ক্লায়েন্টের কোড ভেরিফাই করে ফাইল ডাউনলোড করার ফাংশন
  const handleConfirmDownload = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setCodeError("Enter Code!");
      return;
    }

    try {
      setDownloading(true);
      setCodeError("");

      const res = await fetch(
        `http://localhost:5000/api/projects/${project._id}/download?code=${encodeURIComponent(inputCode)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (res.ok) {
        const fullUrl = `http://localhost:5000${data.fileUrl}`;
        const response = await fetch(fullUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = data.fileName || "project-file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        setIsEnteringCode(false);
        setInputCode("");
      } else {
        setCodeError(data.message || "Invalid Code");
      }
    } catch (err) {
      console.error("Download error:", err);
      setCodeError("Server error!");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 font-sans tracking-tight space-y-6">
      {/* হেডার */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4 pr-10">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-stone-900 tracking-tight">
            Project Files & Delivery
          </h2>
          <p className="text-xs text-stone-500 font-normal mt-0.5">
            Manage and download your final work deliverables.
          </p>
        </div>

        {/* Protected Badge */}
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50/80 text-amber-800 border border-amber-200/60 flex items-center gap-1.5 shrink-0 font-sans">
          <svg
            className="w-3.5 h-3.5 text-amber-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Protected
        </span>
      </div>

      {/* ফাইল লিস্ট ও বাটন এলাকা */}
      {project?.projectFile && project.projectFile.fileUrl ? (
        <div className="bg-[#f9f9f8] border border-stone-200/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {/* Folder Icon */}
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <svg
                className="w-5 h-5 text-stone-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-stone-900 text-sm truncate font-sans">
                {project.projectFile.fileName}
              </h4>
              <p className="text-xs text-stone-400 font-normal mt-0.5 font-sans">
                Uploaded on:{" "}
                {new Date(project.projectFile.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* রোল অনুযায়ী বাটন স্ব্যাপ */}
          <div className="w-full sm:w-auto flex justify-end">
            {isFreelancer ? (
              /* ফ্রিল্যান্সারের ডিলিট বাটন */
              <button
                onClick={handleDeleteFile}
                disabled={deleting}
                className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 font-sans"
              >
                <svg
                  className="w-3.5 h-3.5 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {deleting ? "Deleting..." : "Delete File"}
              </button>
            ) : /* ক্লায়েন্টের সিক্রেট কোড + ডাউনলোড বাটন */
            !isEnteringCode ? (
              <button
                onClick={() => {
                  setIsEnteringCode(true);
                  setCodeError("");
                }}
                className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 font-sans"
              >
                <svg
                  className="w-4 h-4 text-stone-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download File
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                <form
                  onSubmit={handleConfirmDownload}
                  className="bg-stone-900 p-1.5 sm:p-1 rounded-xl flex flex-row items-center border border-stone-800 shadow-sm w-full sm:w-auto transition-all gap-1"
                >
                  <input
                    type="text"
                    required
                    placeholder="Enter Code..."
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setCodeError("");
                    }}
                    className="bg-transparent text-white text-xs font-sans font-medium px-3 py-1.5 flex-1 sm:w-32 focus:outline-none placeholder:text-stone-500 placeholder:font-normal placeholder:font-sans min-w-0"
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={downloading}
                    className="bg-white hover:bg-stone-100 text-stone-900 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap shadow-2xs font-sans shrink-0"
                  >
                    {downloading ? "..." : "Download"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEnteringCode(false);
                      setCodeError("");
                      setInputCode("");
                    }}
                    className="text-stone-400 hover:text-white px-2 text-xs font-bold cursor-pointer transition-colors font-sans shrink-0"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </form>

                {codeError && (
                  <p className="text-[11px] text-rose-500 font-medium pr-1 animate-pulse font-sans">
                    {codeError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-[#f9f9f8] rounded-2xl border border-dashed border-stone-300/80">
          <p className="text-stone-400 text-xs font-normal font-sans">
            No project file uploaded by the freelancer yet.
          </p>
        </div>
      )}

      {/* 🚀 ফ্রিল্যান্সার আপলোড ফর্ম */}
      {isFreelancer && (
        <form
          onSubmit={handleUploadSubmit}
          className="border-t border-stone-100 pt-5 space-y-4 font-sans"
        >
          <h3 className="text-xs font-semibold text-stone-900 tracking-wider uppercase font-sans">
            Upload Final Project Work
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5 font-sans">
                Choose Delivery File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="text-xs text-stone-500 font-sans file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 file:font-sans cursor-pointer w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5 font-sans">
                Set Secret Code for Client
              </label>
              <input
                type="text"
                required
                placeholder="Enter Secret Code (e.g. 123456)"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#f8f7f4] border border-stone-200/80 rounded-xl focus:outline-none focus:border-stone-900 font-sans font-medium text-stone-800 placeholder:text-stone-400 placeholder:font-normal placeholder:font-sans transition-all"
              />
            </div>
          </div>

          {selectedFile && (
            <button
              type="submit"
              disabled={uploading}
              className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer w-full sm:w-auto font-sans"
            >
              {uploading ? "Uploading..." : "Upload File Now"}
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default ProjectFiles;
