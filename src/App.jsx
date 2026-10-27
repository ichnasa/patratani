import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import TenderDetailPage from "./pages/TenderDetailPage";
import CheckoutEscrowPage from "./pages/CheckoutEscrowPage";
import HandoverPage from "./pages/HandoverPage";
import CompletedPage from "./pages/CompletedPage";
import ProfilePage from "./pages/ProfilePage";
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
          <Route path="/tender" element={<TenderDetailPage />} />
          <Route path="/tender/:id" element={<TenderDetailPage />} />
          <Route
            path="/escrow"
            element={
              <ProtectedRoute>
                <CheckoutEscrowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/escrow/:id"
            element={
              <ProtectedRoute>
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
