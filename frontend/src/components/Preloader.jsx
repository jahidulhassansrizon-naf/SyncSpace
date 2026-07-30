import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Preloader = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // ডেমো লোডিং কাউন্টার (তুমি চাইলে এখানে রিয়েল এসেট লোডিং হুক যুক্ত করতে পারো)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLoadingComplete(); // লোডিং শেষ হলে প্যারেন্ট কম্পোনেন্টকে জানাবে
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc", // তোমার ল্যান্ডিং পেজের ব্যাকগ্রাউন্ড কালারের সাথে মিলিয়ে নিতে পারো
        color: "#0f172a",
      }}
    >
      {/* লোগো অ্যানিমেশন */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#0f172a",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "24px",
          }}
        >
          S
        </div>
        <span
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            letterSpacing: "-0.5px",
          }}
        >
          SyncSpace
        </span>
      </motion.div>

      {/* প্রোগ্রেস বার */}
      <div
        style={{
          width: "200px",
          height: "6px",
          backgroundColor: "#e2e8f0",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            backgroundColor: "#fbbf24", // তোমার ওয়েবসাইটের গোল্ডেন/ইয়েলো থিম কালার
          }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

      <p
        style={{
          marginTop: "12px",
          fontSize: "14px",
          color: "#64748b",
          fontWeight: "500",
        }}
      >
        Loading 3D Workspace... {progress}%
      </p>
    </motion.div>
  );
};

export default Preloader;
