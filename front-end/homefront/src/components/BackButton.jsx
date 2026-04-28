import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    if (location.pathname.startsWith("/admin")) {
      navigate("/admin/dashboard");
      return;
    }

    navigate("/");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed top-4 left-4 z-[60] inline-flex items-center justify-center h-10 w-10 rounded-full bg-yellow text-green shadow-lg ring-1 ring-black/10 transition-colors hover:bg-yellow/90"
      aria-label="Go back"
    >
      <span className="text-lg">←</span>
    </button>
  );
}
