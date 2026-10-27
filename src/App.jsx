import React, { useState, useEffect } from "react";
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
  const getInitialRoute = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/login")) return "login";
    if (path.includes("/register")) return "register";
    return "home";
  };

  const [currentPage, setCurrentPage] = useState(getInitialRoute);

  const navigate = (page) => {
    setCurrentPage(page);
    const routeMap = {
      home: "/",
      login: "/login",
      register: "/register",
      explore: "/explore",
      "tender-detail": "/tender-detail",
      "checkout-escrow": "/checkout-escrow",
      handover: "/handover",
      completed: "/completed",
      profile: "/profile",
    };
    const targetUrl = routeMap[page] || "/";
    window.history.pushState({}, "", targetUrl);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes("/login")) {
        setCurrentPage("login");
      } else if (path.includes("/register")) {
        setCurrentPage("register");
      } else {
        setCurrentPage("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (currentPage === "login") {
    return (
      <LoginPage
        onLogin={() => navigate("home")}
        onNavigateRegister={() => navigate("register")}
        onBackHome={() => navigate("home")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onRegister={() => navigate("home")}
        onNavigateLogin={() => navigate("login")}
        onBackHome={() => navigate("home")}
      />
    );
  }

  if (currentPage === "explore") {
    return <ExplorePage />;
  }

  if (currentPage === "tender-detail") {
    return <TenderDetailPage onBack={() => navigate("home")} />;
  }

  if (currentPage === "checkout-escrow") {
    return <CheckoutEscrowPage onBack={() => navigate("home")} />;
  }

  if (currentPage === "handover") {
    return <HandoverPage onBack={() => navigate("home")} />;
  }

  if (currentPage === "completed") {
    return (
      <CompletedPage
        onBack={() => navigate("home")}
        onExploreMore={() => navigate("explore")}
      />
    );
  }

  if (currentPage === "profile") {
    return (
      <ProfilePage
        onBack={() => navigate("home")}
        onLogout={() => navigate("login")}
      />
    );
  }

  return <HomePage />;
}
