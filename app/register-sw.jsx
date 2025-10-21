"use client";
import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          console.log("✅ FlowRSVP Service Worker registered");

          // Listen for updates
          reg.onupdatefound = () => {
            const newWorker = reg.installing;
            newWorker.onstatechange = () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                showUpdateToast();
              }
            };
          };
        })
        .catch((err) => console.error("SW registration failed:", err));

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "UPDATE_AVAILABLE") {
          showUpdateToast();
        }
      });
    }
  }, []);

  function showUpdateToast() {
    const toast = document.createElement("div");
    toast.textContent = "✨ New version available — Refresh now";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#125AA2",
      color: "#fff",
      padding: "10px 18px",
      borderRadius: "8px",
      fontWeight: "600",
      zIndex: 9999,
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    });
    toast.onclick = () => window.location.reload(true);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 8000);
  }

  return null;
}
