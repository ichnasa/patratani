import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/tender" element={<TenderDetailPage />} />
        <Route path="/tender/:id" element={<TenderDetailPage />} />
        <Route path="/escrow" element={<CheckoutEscrowPage />} />
        <Route path="/escrow/:id" element={<CheckoutEscrowPage />} />
        <Route path="/handover" element={<HandoverPage />} />
        <Route path="/handover/:id" element={<HandoverPage />} />
        <Route path="/completed" element={<CompletedPage />} />
        <Route path="/completed/:id" element={<CompletedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
