import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // LocalStorage থেকে টোকেন চেক করবো
  const token = localStorage.getItem("token");

  // টোকেন না থাকলে লগইন পেজে রিডাইরেক্ট করবো
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // টোকেন থাকলে ডেসার্ট বা চিলড্রেন পেজে ঢুকতে দেবো
  return children;
};

export default ProtectedRoute;
