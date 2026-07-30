import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f4f6f9] px-4 overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-slate-300/50 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-300/40 rounded-full blur-[140px] pointer-events-none"></div>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transition: "transform 0.1s ease-out",
        }}
        className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl border border-slate-200/80 p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] text-center group overflow-hidden"
      >
        <div
          className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(0, 0, 0, 0.04), transparent 40%)`,
          }}
        ></div>

        <div className="relative z-10">
          <h1 className="text-7xl md:text-8xl font-black text-slate-900 mb-4 tracking-tighter">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            The page you are looking for doesn't exist or has been moved to
            another URL.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
