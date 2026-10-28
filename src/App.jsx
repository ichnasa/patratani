import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import DetailEtalasePage from "./pages/DetailEtalasePage";
import CreateEtalasePage from "./pages/CreateEtalasePage";
import CreateTenderPage from "./pages/CreateTenderPage";
import TenderDetailPage from "./pages/TenderDetailPage";
import DetailTenderPembeliPage from "./pages/DetailTenderPembeliPage";
import CheckoutEscrowPage from "./pages/CheckoutEscrowPage";
import HandoverPage from "./pages/HandoverPage";
import CompletedPage from "./pages/CompletedPage";
import ProfilePage from "./pages/ProfilePage";
import FarmerDashboardPage from "./pages/FarmerDashboardPage";
import BuyerDashboardPage from "./pages/BuyerDashboardPage";
import AdminDisputeDashboardPage from "./pages/AdminDisputeDashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/etalase" element={<DetailEtalasePage />} />
          <Route path="/etalase/:id" element={<DetailEtalasePage />} />
          <Route
            path="/etalase/create"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <CreateEtalasePage />
              </ProtectedRoute>
            }
          />
          <Route path="/tender" element={<TenderDetailPage />} />
          <Route path="/tender/:id" element={<TenderDetailPage />} />
          <Route
            path="/tender/pembeli"
            element={
              <ProtectedRoute>
                <DetailTenderPembeliPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tender/pembeli/:id"
            element={
              <ProtectedRoute>
                <DetailTenderPembeliPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tender/create"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <CreateTenderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/escrow"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <CheckoutEscrowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/escrow/:id"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <CheckoutEscrowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handover"
            element={
              <ProtectedRoute>
                <HandoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handover/:id"
            element={
              <ProtectedRoute>
                <HandoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/completed"
            element={
              <ProtectedRoute>
                <CompletedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/completed/:id"
            element={
              <ProtectedRoute>
                <CompletedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/farmer"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/buyer"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <BuyerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDisputeDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
