import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://syncspace-ahmd.onrender.com");

const Team = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // রিয়েল-টাইম অনলাইন ইউজার স্ট্যাটাস ট্র্যাক করার স্টেট
  const [onlineUsers, setOnlineUsers] = useState({});

  const token = localStorage.getItem("token");

  // পেজ লোড হলে LocalStorage থেকে ইউজারের ডেটা লোড করা
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // ইউজার লগইন করার সাথে সাথে সকেটে অনলাইন স্ট্যাটাস পাঠানো
  useEffect(() => {
    if (user && (user._id || user.id)) {
      const currentUserId = user._id || user.id;
      socket.emit("user_online", currentUserId);
    }
  }, [user]);

  // 🟢 রিয়েল-টাইম ইউজার অনলাইন/অফলাইন স্ট্যাটাস আপডেট লিসেনার ও স্টেট সিঙ্ক
  useEffect(() => {
    const handleStatusUpdate = ({ userId, isOnline }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: isOnline,
      }));

      // 💡 সাথে সাথে teamMembers স্টেট আপডেট করা যাতে রিলোড না লাগে
      setTeamMembers((prevMembers) =>
        prevMembers.map((member) =>
          member._id === userId ? { ...member, isOnline } : member,
        ),
      );
    };

    socket.on("update_user_status", handleStatusUpdate);
    return () => socket.off("update_user_status", handleStatusUpdate);
  }, []);

  // টিম মেম্বারদের ডাটা ব্যাকএন্ড থেকে ফেচ করা
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await fetch(
          "https://syncspace-ahmd.onrender.com/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        if (res.ok) {
          setTeamMembers(data);
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTeamMembers();
    }
  }, [token]);

  // লগআউট ফাংশন
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Tasks", path: "/projects" },
    { name: "Team", path: "/team", active: true },
  ];

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // ইউজারের অনলাইন স্ট্যাটাস চেক করার হেল্পার ফাংশন
  const isUserOnline = (userId) => {
    return onlineUsers[userId] || false;
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-[#f4f6f9] text-slate-800"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      {/* Mobile Header Toggle */}
      <div className="md:hidden flex items-center justify-between bg-white/90 backdrop-blur-sm px-6 py-4 border-b border-slate-100 sticky top-0 z-30">
        <div className="text-xl font-bold flex items-center gap-2 text-slate-950 tracking-tight">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black shadow-md shadow-slate-900/10">
            S
          </div>
          SyncSpace
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none cursor-pointer"
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

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden cursor-pointer"
        ></div>
      )}

      {/* 1. Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-white p-6 flex flex-col justify-between border-r border-slate-100 z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo (Desktop) */}
          <div className="hidden md:flex text-2xl font-bold items-center gap-3 mb-10 text-slate-950 tracking-tight">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-slate-900/20">
              S
            </div>
            SyncSpace
          </div>

          {/* Navigation Links */}
          <nav>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group ${
                      link.active
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-10 pt-6 border-t border-slate-100 space-y-5">
          <div className="flex items-center gap-4 p-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white ring-2 ring-slate-100 flex items-center justify-center text-slate-800 font-black text-2xl shadow-inner">
                {getUserInitial(user?.name)}
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
              <p className="text-base font-bold text-slate-950 truncate">
                {user ? user.name : "Loading..."}
              </p>
              <p className="text-sm text-slate-500 truncate font-medium">
                {user ? user.role : "Member"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-red-600 p-3.5 rounded-xl hover:bg-red-50 transition-colors duration-200 cursor-pointer group"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-auto md:h-20 bg-white px-6 md:px-8 py-4 md:py-0 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
              Team Members
            </h2>
            <p className="text-base text-slate-600 mt-0.5 font-medium">
              Manage and view all registered users in SyncSpace
            </p>
          </div>
        </header>

        {/* Team Members List Section */}
        <div className="p-4 sm:p-6 md:p-8">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-medium">
              Loading team members...
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-500 font-medium shadow-sm">
              No team members found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => {
                const memberOnline =
                  isUserOnline(member._id) || member.isOnline;

                return (
                  <div
                    key={member._id}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                        {getUserInitial(member.name)}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          memberOnline
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-stone-300"
                        }`}
                        title={memberOnline ? "Online" : "Offline"}
                      ></span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-bold text-slate-950 truncate tracking-tight">
                          {member.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            memberOnline
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {memberOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium mt-0.5">
                        {member.email}
                      </p>
                      <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                        {member.role || "Member"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Team;
