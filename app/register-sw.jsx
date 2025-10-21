"use client";
import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("✅ FlowRSVP Service Worker registered"))
        .catch((err) => console.warn("❌ SW registration failed", err));
    }
  }, []);

  return null;
}
