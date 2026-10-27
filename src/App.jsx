import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import TenderDetailPage from "./pages/TenderDetailPage";
import CheckoutEscrowPage from "./pages/CheckoutEscrowPage";
import HandoverPage from "./pages/HandoverPage";
import CompletedPage from "./pages/CompletedPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  if (currentPage === "explore") {
    return <ExplorePage />;
  }

  if (currentPage === "tender-detail") {
    return <TenderDetailPage onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "checkout-escrow") {
    return <CheckoutEscrowPage onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "handover") {
    return <HandoverPage onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "completed") {
    return (
      <CompletedPage
        onBack={() => setCurrentPage("home")}
        onExploreMore={() => setCurrentPage("explore")}
      />
    );
  }

  if (currentPage === "profile") {
    return (
      <ProfilePage
        onBack={() => setCurrentPage("home")}
        onLogout={() => setCurrentPage("home")}
      />
    );
  }

  return <HomePage />;
}
