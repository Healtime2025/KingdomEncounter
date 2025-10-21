"use client";
import { useEffect, useState } from "react";

export default function FlowRSVP() {
  const PROXY_URL = "/api/proxy";
  const TARGET_BACKEND =
    "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

  const [eventName, setEventName] = useState("Community Gathering");
  const [dateStr, setDateStr] = useState("Saturday 9:00–16:00");
  const [venueStr, setVenueStr] = useState("School Hall");
  const [ref, setRef] = useState("direct");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState({ wa: "#", sms: "#", mail: "#" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEventName(params.get("event") || "Community Gathering");
    setDateStr(params.get("date") || "Saturday 9:00–16:00");
    setVenueStr(params.get("venue") || "School Hall");
    setRef(params.get("ref") || "direct");
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
      setMessage(`Your previous response (${already.toUpperCase()}) is already recorded.`);
      setSubmitted(true);
      return;
    }
    if (!name.trim()) {
      alert("Please enter your name before confirming.");
      return;
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
        setMessage(`We’ve recorded your response: ${choice.toUpperCase()}. See you soon!`);
        setSubmitted(true);
      } else {
        alert(res.error || "Could not save your response.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
  }

  return (
    <div style={styles.body}>
      {!submitted ? (
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

          <div style={styles.choices}>
            <button style={styles.button} onClick={() => respond("yes")}>
              ✅ Yes
            </button>
            <button style={styles.button} onClick={() => respond("maybe")}>
              🤔 Maybe
            </button>
            <button style={styles.button} onClick={() => respond("no")}>
              ❌ No
            </button>
          </div>

          <div style={styles.share}>
            <a href={links.wa} target="_blank" rel="noreferrer" style={styles.link}>
              📱 WhatsApp
            </a>{" "}
            |{" "}
            <a href={links.sms} target="_blank" rel="noreferrer" style={styles.link}>
              💬 SMS
            </a>{" "}
            |{" "}
            <a href={links.mail} target="_blank" rel="noreferrer" style={styles.link}>
              📧 Email
            </a>
          </div>
        </div>
      ) : (
        <div style={styles.thankyou}>
          <div style={styles.icon}>🎉</div>
          <h2>Thank You!</h2>
          <p style={{ marginBottom: 20 }}>{message}</p>
          <button
            style={styles.primaryButton}
            onClick={() => (window.location.href = "/")}
          >
            Return Home
          </button>
          <div style={{ marginTop: 15 }}>
            <a
              href="/"
              style={{ color: "#125AA2", fontWeight: 600, textDecoration: "none" }}
            >
              ← Back to Invitation
            </a>
          </div>
        </div>
      )}

      {/* 👑 Global Royal Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes popIn {
          from {
            transform: scale(0.7);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .fadeIn {
          animation: fadeIn 0.6s ease;
        }
        .popIn {
          animation: popIn 0.6s ease;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------
 * 🎨 Royal Styles — Auto Thank-You Edition with Animations
 * ------------------------------------------------------------ */
const styles = {
  body: {
    fontFamily: '"Inter", system-ui',
    background: "linear-gradient(135deg, #125AA2, #4DB6E6)",
    color: "#fff",
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    maxWidth: 420,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "40px 30px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
    textAlign: "center",
    animation: "fadeIn 0.6s ease",
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "6px 0",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
  },
  choices: { marginTop: 10 },
  button: {
    margin: "8px 5px",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
  share: { marginTop: 25, fontSize: 15 },
  link: { color: "#fff", textDecoration: "none" },
  thankyou: {
    background: "rgba(255,255,255,0.95)",
    color: "#0B1220",
    borderRadius: 16,
    boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
    padding: "40px 30px",
    textAlign: "center",
    animation: "fadeIn 0.7s ease",
  },
  icon: { fontSize: 55, marginBottom: 10, animation: "popIn 0.6s ease" },
  primaryButton: {
    background: "#125AA2",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
  },
};
