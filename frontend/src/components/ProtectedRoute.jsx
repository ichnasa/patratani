import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const roleLower = (currentUser.role || "").toLowerCase();
    const isAdmin = roleLower.includes("admin");
    const isFarmer =
      !isAdmin && (roleLower.includes("petani") || roleLower.includes("mitra"));
    const isBuyer =
      !isAdmin && (roleLower.includes("pembeli") || roleLower.includes("umkm"));

    const hasAccess = allowedRoles.some((r) => {
      if (r === "admin") return isAdmin;
      if (r === "farmer" || r === "petani") return isFarmer;
      if (r === "buyer" || r === "pembeli") return isBuyer;
      return false;
    });

    if (!hasAccess) {
      if (isAdmin) return <Navigate to="/admin/disputes" replace />;
      if (isFarmer) return <Navigate to="/dashboard/farmer" replace />;
      if (isBuyer) return <Navigate to="/dashboard/buyer" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
