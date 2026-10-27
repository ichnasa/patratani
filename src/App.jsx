import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import TenderDetailPage from "./pages/TenderDetailPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  if (currentPage === "explore") {
    return <ExplorePage />;
  }

  if (currentPage === "tender-detail") {
    return <TenderDetailPage onBack={() => setCurrentPage("home")} />;
  }

  return <HomePage />;
}
