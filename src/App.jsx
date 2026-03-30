import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import OasisPage from "./pages/OasisPage";
import ConnectPage from "./pages/ConnectPage";
import StorePage from "./pages/StorePage";
import DiscoverPage from "./pages/DiscoverPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");

  const nav = {
    onBack: () => setCurrentPage("home"),
    onLogout: () => setCurrentPage("login"),
    onViewProfile: () => setCurrentPage("profile"),
    onOpenOasis: () => setCurrentPage("oasis"),
    onOpenConnect: () => setCurrentPage("connect"),
    onOpenStore: () => setCurrentPage("store"),
    onOpenDiscover: () => setCurrentPage("discover"),
  };

  if (currentPage === "oasis") {
    return <OasisPage onBack={nav.onBack} />;
  }

  if (currentPage === "connect") {
    return <ConnectPage {...nav} />;
  }

  if (currentPage === "store") {
    return <StorePage {...nav} />;
  }

  if (currentPage === "discover") {
    return <DiscoverPage {...nav} />;
  }

  if (currentPage === "profile") {
    return <ProfilePage {...nav} />;
  }

  if (currentPage === "home") {
    return <HomePage {...nav} />;
  }

  return <LoginPage onLogin={() => setCurrentPage("home")} />;
}
