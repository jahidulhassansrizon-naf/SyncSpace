import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // যদি টোকেন থাকে (মানে ইউজার অলরেডি লগইন করা), তবে তাকে ড্যাশবোর্ডে পাঠিয়ে দেবো
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // টোকেন না থাকলে লগইন বা রেজিস্টার পেজে ঢুকতে দেবো
  return children;
};

export default PublicRoute;
