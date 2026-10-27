import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import TenderDetailPage from "./pages/TenderDetailPage";
import CheckoutEscrowPage from "./pages/CheckoutEscrowPage";

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

  return <HomePage />;
}
