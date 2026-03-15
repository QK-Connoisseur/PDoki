import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");

  if (currentPage === "profile") {
    return <ProfilePage onBack={() => setCurrentPage("home")} onLogout={() => setCurrentPage("login")} />;
  }

  if (currentPage === "home") {
    return (
      <HomePage
        onLogout={() => setCurrentPage("login")}
        onViewProfile={() => setCurrentPage("profile")}
      />
    );
  }

  return <LoginPage onLogin={() => setCurrentPage("home")} />;
}
