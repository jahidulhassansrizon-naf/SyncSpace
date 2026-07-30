import React, { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Hero3D from "../components/Hero3D";

// 🚀 থ্রি-ডি ব্যাকগ্রাউন্ড লেজি লোড করা হলো
const PageBackground3D = lazy(() => import("../components/PageBackground3D"));
import {
  ShieldCheck,
  Layers,
  Lock,
  Unlock,
  Zap,
  FileArchive,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  FileCheck2,
  Cpu,
  UserCheck,
  HardDrive,
  Key,
} from "lucide-react";

export default function SyncSpace() {
  // 🔑 ডিফল্ট স্টেট খালি রাখা হলো যাতে রিফ্রেশে তালা লক থাকে
  const [secretCode, setSecretCode] = useState("");

  // পাসকোড টেস্ট করা (ডিফল্ট কোড: 430665)
  const isUnlocked = secretCode.trim() === "430665";

  // 🖱️ পারফেক্ট স্মুথ স্ক্রোল হ্যান্ডলার (হেডার অফসেট সহ)
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80; // ওপরের স্টিকি হেডারের উচ্চতা বাদ দেওয়ার জন্য
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div
      className="relative z-0 min-h-screen bg-slate-100 text-slate-800 selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      {/* 🚀 ৩ডি সাইবার পার্টিকেল ব্যাকগ্রাউন্ড (Suspense দিয়ে র‍্যাপ করা হলো) */}
      <Suspense fallback={null}>
        <PageBackground3D />
      </Suspense>

      {/* 📱 মূল কন্টেন্ট লেয়ার */}
      <div className="relative z-10">
        {/* Announcement Bar */}
        <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 text-center font-medium">
          Escrow & Direct File Delivery Platform for Professionals
        </div>

        {/* Header */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-slate-200/80 bg-slate-100/90 backdrop-blur-md sticky top-0 z-50 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 rounded-xl flex items-center justify-center font-extrabold text-lg sm:text-xl text-amber-400 shadow-md">
              S
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
              SyncSpace
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works")}
              className="hidden md:inline-block text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, "security")}
              className="hidden md:inline-block text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold cursor-pointer"
            >
              Security
            </a>

            <Link
              to="/login"
              className="text-slate-700 hover:text-slate-950 transition-colors text-xs sm:text-sm font-semibold"
            >
              Login
            </Link>

            <Link
              to="/dashboard"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">Go</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-16 sm:pb-24 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Side Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-6 space-y-6 sm:space-y-8"
          >
            <div className="space-y-4 text-center lg:text-left">
              <motion.div
                variants={fadeInUp}
                className="inline-block px-3 py-1 bg-amber-100/70 border border-amber-300/80 rounded-full text-amber-900 text-xs font-bold uppercase tracking-wider"
              >
                100% Risk-Free Workspaces
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]"
              >
                Collaborate with <br />
                <span className="text-slate-900">Absolute Trust.</span> <br />
                <span className="text-amber-500">Zero Risk.</span> Direct
                Delivery.
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed pt-2"
              >
                Escrow workspaces built for freelancers and clients to trade
                files with complete protection.
              </motion.p>
            </div>

            <motion.div variants={fadeInUp} className="pt-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Verified Profiles",
                    step: "Step 1",
                    color: "emerald",
                  },
                  {
                    icon: Layers,
                    title: "Project To-Do",
                    step: "Step 2",
                    color: "amber",
                  },
                  {
                    icon: Lock,
                    title: "Locked Workspace",
                    step: "Locked",
                    color: "rose",
                  },
                  {
                    icon: Zap,
                    title: "Activation Switch",
                    step: "Active",
                    color: "emerald",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-white/80 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 flex flex-col items-center text-center space-y-2 shadow-xs cursor-pointer"
                  >
                    <div
                      className={`p-2 rounded-xl bg-${item.color}-100 text-${item.color}-700`}
                    >
                      <item.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {item.title}
                    </span>
                    <span
                      className={`text-[11px] bg-${item.color}-100/80 text-${item.color}-800 px-3 py-0.5 rounded-full font-semibold`}
                    >
                      {item.step}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* ✨ অ্যানিমেটেড পাইপলাইন লাইন */}
              <div className="hidden sm:flex items-center justify-between text-xs text-slate-400 pt-2">
                <div className="h-[3px] bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 flex-1 mr-4 rounded-full relative overflow-hidden">
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-white/70 w-1/2 blur-[1px]"
                  />
                </div>
                <span className="font-bold text-slate-500 tracking-wider text-[11px] uppercase">
                  Pipeline Workflow
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side Interactive 3D Vault & Card */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0 flex flex-col items-center justify-center">
            {/* 3D Interactive Canvas */}
            <div className="w-full relative z-20 flex items-center justify-center">
              <Hero3D isUnlocked={isUnlocked} />
            </div>

            {/* Floating UI Card Below 3D */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full relative z-10 -mt-12 sm:-mt-16 max-w-md mx-auto"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                        isUnlocked ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    ></span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Encrypted Vault Stream
                    </h3>
                  </div>

                  {isUnlocked ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Unlock size={10} /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={10} /> LOCKED
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl mb-3 text-[11px] font-medium text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Key size={13} className="text-amber-600" />
                    Try Passcode:
                  </span>
                  <code className="bg-amber-200/60 px-2 py-0.5 rounded font-mono font-bold text-slate-900">
                    430665
                  </code>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl text-amber-500 shadow-xs border border-slate-200/80">
                        <FileArchive size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          Final_Deliverables.zip
                        </p>
                        <p className="text-[10px] text-slate-500">
                          24.5 MB • AES-256
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">
                        Passcode
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Code"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        className={`bg-white border text-slate-900 font-mono text-xs font-bold rounded-lg px-2.5 py-1 w-24 text-center focus:outline-none transition-all shadow-2xs ${
                          isUnlocked
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-700"
                            : "border-slate-300 focus:ring-2 focus:ring-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-12 sm:py-20 bg-slate-200/50 backdrop-blur-sm border-t border-slate-300/60"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold tracking-wider text-amber-700 uppercase bg-amber-200/60 px-3 py-1 rounded-full">
                Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                How SyncSpace Works
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                A simple process to ensure safe file exchange and client
                satisfaction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: UserCheck,
                  step: "Step 01",
                  title: "Create Workspace",
                  desc: "Set up project parameters and invite team members or clients.",
                  color: "emerald",
                },
                {
                  icon: FileCheck2,
                  step: "Step 02",
                  title: "Upload Files",
                  desc: "Upload final project files. Access stays protected until approved.",
                  color: "amber",
                },
                {
                  icon: KeyRound,
                  step: "Step 03",
                  title: "Passcode Exchange",
                  desc: "Share access credentials securely inside the workspace.",
                  color: "rose",
                },
                {
                  icon: CheckCircle2,
                  step: "Step 04",
                  title: "Download Work",
                  desc: "Clients enter the code to unlock and download original deliverables.",
                  color: "emerald",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all relative group"
                >
                  <div
                    className={`w-12 h-12 bg-${card.color}-100 text-${card.color}-700 rounded-xl flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <card.icon size={24} />
                  </div>
                  <span
                    className={`text-xs font-bold text-${card.color}-600 uppercase tracking-wider block mb-1`}
                  >
                    {card.step}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section
          id="security"
          className="py-20 bg-slate-100/60 backdrop-blur-xs"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase bg-emerald-100 px-3 py-1 rounded-full">
                  Security
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  Designed to Protect Your Assets.
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Protecting original work and payments using flexible
                  validation systems.
                </p>

                <div className="space-y-4 pt-2">
                  {[
                    {
                      title: "Protected Storage",
                      desc: "Deliverables stay encrypted until valid passcode input.",
                    },
                    {
                      title: "Workspace Messaging",
                      desc: "Direct workspace channel for sharing access keys.",
                    },
                    {
                      title: "File Integrity Check",
                      desc: "Ensures delivered files match original uploads.",
                    },
                  ].map((sec, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {sec.title}
                        </h4>
                        <p className="text-xs text-slate-500">{sec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-slate-900 text-white p-6 rounded-3xl space-y-3 shadow-lg"
                >
                  <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-bold">
                    <Lock size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-amber-400">
                    Passcode Layer
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Prevents downloading source files without explicit seller
                    release.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl space-y-3 shadow-xs"
                >
                  <div className="w-10 h-10 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                    <Cpu size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">
                    Pipeline Tracking
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tracks project progress through clear development steps.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl space-y-3 shadow-xs"
                >
                  <div className="w-10 h-10 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">
                    Profile Badges
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    User badges help establish credibility between
                    collaborators.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-slate-900 text-white p-6 rounded-3xl space-y-3 shadow-lg"
                >
                  <div className="w-10 h-10 bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center font-bold">
                    <HardDrive size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-emerald-400">
                    Cloud Storage
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Fast file delivery and storage redundancy.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center font-extrabold text-lg text-slate-950">
                    S
                  </div>
                  <span className="font-extrabold text-xl text-white tracking-tight">
                    SyncSpace
                  </span>
                </div>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                  Escrow workspace platform designed for safe file sharing
                  between freelancers and clients.
                </p>
              </div>

              <div>
                <h4 className="text-white font-bold text-sm mb-4">Links</h4>
                <ul className="space-y-2.5 text-xs font-medium">
                  <li>
                    <a
                      href="#how-it-works"
                      onClick={(e) => scrollToSection(e, "how-it-works")}
                      className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#security"
                      onClick={(e) => scrollToSection(e, "security")}
                      className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      Security
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Login
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold text-sm mb-4">Pages</h4>
                <ul className="space-y-2.5 text-xs font-medium">
                  <li>
                    <Link
                      to="/dashboard"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/projects"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Projects
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/team"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Team Workspace
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <p>
                © {new Date().getFullYear()} SyncSpace. All rights reserved.
              </p>
              <p className="text-slate-400 font-medium">
                Designed & Developed by{" "}
                <span className="text-amber-400 font-bold">
                  Jahidul Hassan Srizon
                </span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
