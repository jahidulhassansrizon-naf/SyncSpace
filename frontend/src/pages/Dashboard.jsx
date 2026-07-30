import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import Preloader from "../components/Preloader";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({ totalProjects: 0, totalBudget: 0 });
  const [displayBudget, setDisplayBudget] = useState(0);
  const [statusChartData, setStatusChartData] = useState([]);
  const [budgetChartData, setBudgetChartData] = useState([]);

  const [animationKey, setAnimationKey] = useState(0);

  const token = localStorage.getItem("token");

  const COLORS = {
    todo: "#f59e0b",
    "in-progress": "#0284c7",
    completed: "#059669",
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/projects/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data?.summary || { totalProjects: 0, totalBudget: 0 });

        const breakdownArray = Array.isArray(data?.breakdown)
          ? data.breakdown
          : [];

        const formattedStatus = breakdownArray.map((item) => ({
          name:
            item._id === "todo"
              ? "To Do"
              : item._id === "in-progress"
                ? "In Progress"
                : "Completed",
          value: item.count || 0,
          rawStatus: item._id,
        }));

        const formattedBudget = breakdownArray.map((item) => ({
          name:
            item._id === "todo"
              ? "To Do"
              : item._id === "in-progress"
                ? "In Progress"
                : "Completed",
          Budget: item.totalBudget || 0,
          rawStatus: item._id,
        }));

        setStatusChartData(formattedStatus);
        setBudgetChartData(formattedBudget);
        setAnimationKey((prev) => prev + 1);
      } else {
        fallbackFetchProjects();
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      fallbackFetchProjects();
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };

  const fallbackFetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const projects = await res.json();
        const projectList = Array.isArray(projects) ? projects : [];

        const todoCount = projectList.filter((p) => p.status === "todo").length;
        const inProgressCount = projectList.filter(
          (p) => p.status === "in-progress",
        ).length;
        const completedCount = projectList.filter(
          (p) => p.status === "completed",
        ).length;

        const todoBudget = projectList
          .filter((p) => p.status === "todo")
          .reduce((acc, curr) => acc + (curr.budget || 0), 0);
        const inProgressBudget = projectList
          .filter((p) => p.status === "in-progress")
          .reduce((acc, curr) => acc + (curr.budget || 0), 0);
        const completedBudget = projectList
          .filter((p) => p.status === "completed")
          .reduce((acc, curr) => acc + (curr.budget || 0), 0);

        const totalB = projectList.reduce(
          (acc, curr) => acc + (curr.budget || 0),
          0,
        );

        setSummary({ totalProjects: projectList.length, totalBudget: totalB });

        setStatusChartData([
          { name: "To Do", value: todoCount, rawStatus: "todo" },
          {
            name: "In Progress",
            value: inProgressCount,
            rawStatus: "in-progress",
          },
          { name: "Completed", value: completedCount, rawStatus: "completed" },
        ]);

        setBudgetChartData([
          { name: "To Do", Budget: todoBudget, rawStatus: "todo" },
          {
            name: "In Progress",
            Budget: inProgressBudget,
            rawStatus: "in-progress",
          },
          {
            name: "Completed",
            Budget: completedBudget,
            rawStatus: "completed",
          },
        ]);
        setAnimationKey((prev) => prev + 1);
      }
    } catch (e) {
      console.error(e);
      setSummary({ totalProjects: 0, totalBudget: 0 });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const target = summary?.totalBudget || 0;
    if (target === 0) {
      setDisplayBudget(0);
      return;
    }

    setDisplayBudget(0);
    let start = 0;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayBudget(target);
        clearInterval(timer);
      } else {
        setDisplayBudget(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [summary?.totalBudget, animationKey]);

  const navLinks = [
    { name: "Overview", path: "/dashboard", active: true },
    { name: "Tasks", path: "/projects" },
    { name: "Team", path: "/team" },
  ];

  const getUserInitial = () => {
    return user && user.name ? user.name.charAt(0).toUpperCase() : "U";
  };

  if (loading) {
    return <Preloader onLoadingComplete={() => setLoading(false)} />;
  }

  return (
    <div
      className="relative min-h-screen flex flex-col md:flex-row bg-[#f8f7f4] text-stone-800 overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes spaceFloat1 {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          33% { transform: translate(70px, -110px) rotate(120deg) scale(1.05); }
          66% { transform: translate(-90px, -50px) rotate(240deg) scale(0.95); }
          100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
        }
        @keyframes spaceFloat2 {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          33% { transform: translate(-100px, 80px) rotate(-140deg) scale(0.95); }
          66% { transform: translate(60px, 100px) rotate(-250deg) scale(1.1); }
          100% { transform: translate(0px, 0px) rotate(-360deg) scale(1); }
        }
        @keyframes spaceFloat3 {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          25% { transform: translate(80px, 90px) rotate(90deg) scale(1.05); }
          50% { transform: translate(-70px, -80px) rotate(180deg) scale(0.9); }
          75% { transform: translate(-40px, 70px) rotate(270deg) scale(1.1); }
          100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
        }
        @keyframes softPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(5, 150, 105, 0)); }
          50% { transform: scale(1.02); filter: drop-shadow(0 4px 12px rgba(5, 150, 105, 0.25)); }
        }
        .animate-space-1 { animation: spaceFloat1 9s ease-in-out infinite; }
        .animate-space-2 { animation: spaceFloat2 12s ease-in-out infinite; }
        .animate-space-3 { animation: spaceFloat3 10s ease-in-out infinite; }
        .animate-pulse-budget { animation: softPulse 3s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-12 left-12 text-4xl opacity-60 animate-space-1">
          💵
        </div>
        <div className="absolute top-20 left-1/4 text-5xl opacity-60 animate-space-2">
          💵
        </div>
        <div className="absolute top-10 right-1/3 text-4xl opacity-60 animate-space-3">
          💵
        </div>
        <div className="absolute top-24 right-16 text-6xl opacity-60 animate-space-1">
          💵
        </div>
        <div className="absolute top-1/3 left-8 text-5xl opacity-60 animate-space-2">
          💵
        </div>
        <div className="absolute top-1/3 left-1/3 text-4xl opacity-60 animate-space-3">
          💵
        </div>
        <div className="absolute top-1/3 right-1/4 text-5xl opacity-60 animate-space-1">
          💵
        </div>
        <div className="absolute top-1/2 right-12 text-6xl opacity-60 animate-space-2">
          💵
        </div>
        <div className="absolute top-[52%] left-[18%] text-5xl opacity-60 animate-space-3">
          💵
        </div>
        <div className="absolute top-[58%] left-[42%] text-4xl opacity-60 animate-space-1">
          💵
        </div>
        <div className="absolute top-[63%] right-[32%] text-6xl opacity-60 animate-space-2">
          💵
        </div>
        <div className="absolute top-[70%] left-[25%] text-5xl opacity-60 animate-space-1">
          💵
        </div>
        <div className="absolute top-[75%] right-[20%] text-4xl opacity-60 animate-space-3">
          💵
        </div>
        <div className="absolute bottom-1/3 left-16 text-4xl opacity-60 animate-space-3">
          💵
        </div>
        <div className="absolute bottom-1/3 left-1/2 text-5xl opacity-60 animate-space-1">
          💵
        </div>
        <div className="absolute bottom-1/4 right-1/3 text-4xl opacity-60 animate-space-2">
          💵
        </div>
        <div className="absolute bottom-16 right-20 text-6xl opacity-60 animate-space-3">
          💵
        </div>
        <div className="absolute bottom-10 left-1/4 text-5xl opacity-60 animate-space-1">
          💵
        </div>
        <div className="absolute bottom-8 left-[65%] text-4xl opacity-60 animate-space-2">
          💵
        </div>
      </div>

      <div className="md:hidden flex items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200/60 sticky top-0 z-30">
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
        className={`fixed md:sticky top-0 min-h-screen w-64 bg-white/95 backdrop-blur-md p-6 flex flex-col justify-between border-r border-stone-200/60 z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="hidden md:flex text-2xl font-bold items-center gap-3 mb-10 text-stone-900 tracking-tight">
            <div className="w-10 h-10 bg-stone-900 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-md shadow-stone-900/10">
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
                        ? "bg-stone-900 text-white shadow-md shadow-stone-900/10"
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
            <div className="w-12 h-12 rounded-full bg-stone-100 border-2 border-white ring-2 ring-stone-200/50 flex items-center justify-center text-stone-800 font-black text-2xl shadow-inner">
              {getUserInitial()}
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
            className="w-full flex items-center gap-3 text-sm font-semibold text-stone-600 hover:text-rose-600 p-3.5 rounded-xl hover:bg-rose-50 transition-colors duration-200 cursor-pointer"
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

      <main className="flex-1 flex flex-col min-w-0 relative z-20">
        <header className="h-auto md:h-20 bg-white/90 backdrop-blur-md px-6 md:px-8 py-4 md:py-0 flex items-center justify-between border-b border-stone-200/60 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-800 bg-clip-text text-transparent tracking-tight">
                Dashboard Analytics
              </h2>
            </div>
            <p className="text-base text-stone-600 mt-0.5 font-medium">
              Real-time overview and financial aggregation.
            </p>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-8 flex-1 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-md border border-stone-200/60 p-6 rounded-3xl shadow-sm">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                Total Projects
              </p>
              <h3 className="text-4xl font-extrabold text-stone-900 mt-2">
                {summary?.totalProjects ?? 0}
              </h3>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-stone-200/60 p-6 rounded-3xl shadow-sm animate-pulse-budget">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                Total Budget Value
              </p>
              <h3 className="text-4xl font-extrabold text-emerald-700 mt-2 tracking-tight transition-all duration-300">
                ${displayBudget.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-stone-200/60 p-6 rounded-3xl shadow-sm">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                Active Status Categories
              </p>
              <h3 className="text-4xl font-extrabold text-sky-700 mt-2">
                {statusChartData.filter((d) => d.value > 0).length}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-md border border-stone-200/60 p-6 rounded-3xl shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-stone-900 mb-4 tracking-tight">
                Project Breakdown by Status
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={`pie-${animationKey}`}>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive={true}
                      animationDuration={1200}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.rawStatus] || "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-stone-200/60 p-6 rounded-3xl shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-stone-900 mb-4 tracking-tight">
                Budget Allocation ($)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart key={`bar-${animationKey}`} data={budgetChartData}>
                    <XAxis dataKey="name" stroke="#78716c" />
                    <YAxis stroke="#78716c" />
                    <Tooltip />
                    <Bar
                      dataKey="Budget"
                      radius={[10, 10, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1200}
                    >
                      {budgetChartData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={COLORS[entry.rawStatus] || "#8884d8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
