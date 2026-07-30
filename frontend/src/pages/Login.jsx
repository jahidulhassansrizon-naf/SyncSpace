import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Preloader from "../components/Preloader"; // Preloader কম্পোনেন্ট ইম্পোর্ট করা হলো

const Login = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Mouse Move Interactive Glow & Tilt Effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform =
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`.trim();
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed, try again!");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // সফলভাবে লগইন হওয়ার পর সামান্য বিরতি দিয়ে ড্যাশবোর্ডে নিয়ে যাবে
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f4f6f9] px-4 overflow-hidden font-sans">
      {/* যদি পুরো পেজে লোডিং চলতে থাকে, তবে Preloader দেখাবে */}
      {loading ? (
        <Preloader />
      ) : (
        <>
          {/* Back to Home Button */}
          <Link
            to="/"
            className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold shadow-sm transition-all duration-300 hover:scale-105 cursor-pointer z-20"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Home</span>
          </Link>

          {/* Light Ambient Glow Orbs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-slate-300/50 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-300/40 rounded-full blur-[140px] pointer-events-none"></div>

          {/* Interactive 3D Tilt Card with Spotlight Effect */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transition: "transform 0.1s ease-out",
            }}
            className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl border border-slate-200/80 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] group overflow-hidden"
          >
            {/* Dynamic Mouse Spotlight Overlay */}
            <div
              className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(0, 0, 0, 0.04), transparent 40%)`,
              }}
            ></div>

            {/* Header Section */}
            <div className="relative z-10 text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-xl mb-4 shadow-md shadow-slate-900/10">
                S
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                Welcome Back to{" "}
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  SyncSpace
                </span>
              </h1>
              <p className="text-slate-500 text-sm">
                Please enter your credentials to access your workspace.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="relative z-10 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md cursor-pointer bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Sign In</span>
              </button>
            </form>

            {/* Footer Link */}
            <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-slate-900 font-semibold hover:underline transition-all cursor-pointer"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
