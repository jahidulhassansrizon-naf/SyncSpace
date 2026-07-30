import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "freelancer",
  });

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP!");

      alert(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP!");

      alert("Account Created Successfully! Now please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f4f6f9] px-4 py-12 overflow-hidden font-sans">
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
            {step === 1 ? "01" : "02"}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              SyncSpace
            </span>
          </h1>
          <p className="text-slate-500 text-sm">
            {step === 1
              ? "Create your account to manage your work effortlessly."
              : `Enter the 6-digit verification code sent to ${formData.email}`}
          </p>
        </div>

        {/* Error Alert Box */}
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

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="relative z-10 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 text-slate-900 placeholder-slate-400 text-sm transition-all duration-300"
              />
            </div>

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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Password
              </label>
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                I am a...
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 text-slate-900 text-sm transition-all duration-300 cursor-pointer"
              >
                <option value="freelancer" className="bg-white text-slate-900">
                  Freelancer
                </option>
                <option value="client" className="bg-white text-slate-900">
                  Client
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md mt-2 cursor-pointer ${
                loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 transform hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending Code...</span>
                </div>
              ) : (
                <span>Continue & Send OTP</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="relative z-10 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="123456"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center tracking-[0.5em] text-2xl font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 text-slate-900 placeholder-slate-300 transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md cursor-pointer ${
                loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 transform hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Verifying...</span>
                </div>
              ) : (
                <span>Verify & Complete Signup</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-500 hover:text-slate-900 transition-colors text-center mt-3 cursor-pointer font-medium"
            >
              Back to Change Email
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-slate-900 font-semibold hover:underline transition-all cursor-pointer"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
