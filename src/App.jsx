import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");

  if (currentPage === "home") {
    return <HomePage onLogout={() => setCurrentPage("login")} />;
  }

  return <LoginPage onLogin={() => setCurrentPage("home")} />;
}
