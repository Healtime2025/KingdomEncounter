"use client";
import { useEffect, useState } from "react";

export default function FlowRSVP() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [modal, setModal] = useState({ open: false, title: "", msg: "" });
  const [links, setLinks] = useState({ wa: "#", sms: "#", mail: "#" });

  const PROXY_URL = "/api/proxy";
  const TARGET_BACKEND =
    "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

  const [eventName, setEventName] = useState("Community Gathering");
  const [dateStr, setDateStr] = useState("Saturday 9:00–16:00");
  const [venueStr, setVenueStr] = useState("School Hall");
  const [ref, setRef] = useState("direct");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setEventName(urlParams.get("event") || "Community Gathering");
    setDateStr(urlParams.get("date") || "Saturday 9:00–16:00");
    setVenueStr(urlParams.get("venue") || "School Hall");
    setRef(urlParams.get("ref") || "direct");
  }, []);

  useEffect(() => {
    const inviteLink = window.location.href.split("#")[0];
    setLinks({
      wa:
        "https://wa.me/?text=" +
        encodeURIComponent(
          `You are invited: ${eventName}\n${dateStr} · ${venueStr}\nConfirm here: ${inviteLink}`
        ),
      sms:
        "sms:?&body=" +
        encodeURIComponent(
          `${eventName} — ${dateStr} · ${venueStr}\nConfirm: ${inviteLink}`
        ),
      mail:
        "mailto:?subject=" +
        encodeURIComponent(`Invitation: ${eventName}`) +
        "&body=" +
        encodeURIComponent(`${dateStr} · ${venueStr}\nConfirm here: ${inviteLink}`),
    });
  }, [eventName, dateStr, venueStr]);

  const keyBase = "flowrsvp:" + eventName;

  async function respond(choice) {
    const already = localStorage.getItem(keyBase);
    if (already) {
      return showModal("You’re all set ✅", "Your previous response is already recorded.");
    }
    if (!name.trim()) {
      return showModal("Missing name", "Please enter your name before confirming.");
    }

    const payload = new URLSearchParams();
    payload.set("name", name);
    payload.set("phone", phone);
    payload.set("choice", choice);
    payload.set("event", eventName);
    payload.set("date", dateStr);
    payload.set("venue", venueStr);
    payload.set("ref", ref);
    payload.set("userAgent", navigator.userAgent);

    try {
      const r = await fetch(`${PROXY_URL}?target=${encodeURIComponent(TARGET_BACKEND)}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload,
      });
      const res = await r.json();

      if (res.ok || res.success) {
        localStorage.setItem(keyBase, choice);
        showModal("Thank you! 🎉", `We’ve recorded your response: ${choice.toUpperCase()}. See you soon.`);
      } else {
        showModal("Oops", res.error || "Could not save your response.");
      }
    } catch {
      showModal("Oops", "Network error. Please try again.");
    }
  }

  function showModal(title, msg) {
    setModal({ open: true, title, msg });
  }

  function closeModal() {
    setModal({ ...modal, open: false });
  }

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1>{eventName} 🎉</h1>
        <p>{`${dateStr} • ${venueStr}`}</p>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="tel"
          placeholder="Your Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={() => respond("yes")} style={styles.button}>✅ Yes</button>
          <button onClick={() => respond("maybe")} style={styles.button}>🤔 Maybe</button>
          <button onClick={() => respond("no")} style={styles.button}>❌ No</button>
        </div>

        <div style={styles.share}>
          <a href={links.wa} target="_blank" rel="noreferrer" style={styles.link}>📱 WhatsApp</a> |
          <a href={links.sms} target="_blank" rel="noreferrer" style={styles.link}> 💬 SMS</a> |
          <a href={links.mail} target="_blank" rel="noreferrer" style={styles.link}> 📧 Email</a>
        </div>
      </div>

      {modal.open && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ color: "#125AA2" }}>{modal.title}</h2>
            <p>{modal.msg}</p>
            <button onClick={closeModal} style={styles.modalButton}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -----------------------------
   🎨 Inline Styles
----------------------------- */
const styles = {
  body: {
    fontFamily: "Inter, sans-serif",
    background: "linear-gradient(135deg, #125AA2, #4DB6E6)",
    color: "#fff",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: 400,
    margin: "60px auto",
    background: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "30px 25px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "6px 0",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
  },
  button: {
    margin: "8px 5px",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    background: "#fff",
    color: "#125AA2",
  },
  share: {
    marginTop: 25,
    fontSize: 15,
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    margin: "0 3px",
  },
  modal: {
    display: "flex",
    position: "fixed",
    zIndex: 1000,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    background: "#fff",
    color: "#222",
    padding: 25,
    borderRadius: 12,
    maxWidth: 320,
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  },
  modalButton: {
    background: "#125AA2",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    marginTop: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
};
