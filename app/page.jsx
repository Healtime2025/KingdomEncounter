"use client";
import { useEffect, useRef, useState } from "react";

/** 🔆 Optional: host your poster image in /public and set this to "/kingdom-poster.jpg".
 * If left "", it uses the sunrise gradient.
 */
const POSTER_URL = ""; // e.g. "/kingdom-poster.jpg"

export default function FlowRSVP() {
  const PROXY_URL = "/api/proxy";
  const TARGET_BACKEND =
    "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

  // — Defaults aligned to your poster —
  const [eventName, setEventName] = useState("Kingdom Encounter");
  const [dateStr, setDateStr] = useState("Saturday, 01 November 2025 • 09h00");
  const [venueStr, setVenueStr] = useState("04 Barney Molokwane Street, Trichardt");
  const [ref, setRef] = useState("direct");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState({ wa: "#", sms: "#", mail: "#" });

  // Confetti canvas
  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  const confettiAnimRef = useRef<number | null>(null);

  // 🚫 Hard-block any legacy stats renderers
  useEffect(() => {
    (window as any).updateCounts = () => {};
    (window as any).renderCounts = () => {};
    document.getElementById("statsBar")?.remove();
    document.querySelector("[data-stats-bar]")?.remove();
  }, []);

  // Allow URL overrides (?event=&date=&venue=&ref=)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEventName(params.get("event") || "Kingdom Encounter");
    setDateStr(params.get("date") || "Saturday, 01 November 2025 • 09h00");
    setVenueStr(params.get("venue") || "04 Barney Molokwane Street, Trichardt");
    setRef(params.get("ref") || "direct");
  }, []);

  // Share links
  useEffect(() => {
    const inviteLink = window.location.href.split("#")[0];
    setLinks({
      wa:
        "https://wa.me/?text=" +
        encodeURIComponent(
          `You're invited: ${eventName}\n${dateStr} · ${venueStr}\nRSVP here: ${inviteLink}`
        ),
      sms:
        "sms:?&body=" +
        encodeURIComponent(`${eventName}\n${dateStr} · ${venueStr}\nRSVP: ${inviteLink}`),
      mail:
        "mailto:?subject=" +
        encodeURIComponent(`Invitation: ${eventName}`) +
        "&body=" +
        encodeURIComponent(`${dateStr} · ${venueStr}\nRSVP here: ${inviteLink}`),
    });
  }, [eventName, dateStr, venueStr]);

  const keyBase = "flowrsvp:" + eventName;

  async function respond(choice: "yes" | "maybe" | "no") {
    const already = localStorage.getItem(keyBase);
    if (already) {
      setMessage(`Your previous response (${already.toUpperCase()}) is already recorded.`);
      setSubmitted(true);
      fireConfetti(); // celebrate returning users too
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
        setMessage(`We’ve recorded your response: ${choice.toUpperCase()}. God bless you!`);
        setSubmitted(true);
        fireConfetti();
      } else {
        alert(res.error || "Could not save your response.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
  }

  function fireConfetti() {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const colors = ["#F9C74F", "#FFD166", "#F9844A", "#FFFFFF"];
    const pieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h * 0.5,
      r: 4 + Math.random() * 6,
      c: colors[(Math.random() * colors.length) | 0],
      s: 2 + Math.random() * 3,
      a: Math.random() * Math.PI,
      v: 0.02 + Math.random() * 0.03,
    }));

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const start = performance.now();
    function tick(t: number) {
      ctx.clearRect(0, 0, w, h);
      pieces.forEach(p => {
        p.y += p.s;
        p.x += Math.sin((p.y + p.a) * 0.02) * 1.2;
        p.a += p.v;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        ctx.restore();
      });
      // Stop after ~2.5s
      if (t - start < 2500) {
        confettiAnimRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
        window.removeEventListener("resize", onResize);
      }
    }
    resize();
    confettiAnimRef.current && cancelAnimationFrame(confettiAnimRef.current);
    confettiAnimRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => {
      if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current);
    };
  }, []);

  return (
    <div style={styles.page}>
      {/* Background: poster image (optional) + golden sunrise overlay */}
      {POSTER_URL ? <div style={{ ...styles.bg, backgroundImage: `url(${POSTER_URL})` }} /> : null}
      <div style={styles.overlay} />

      {/* Confetti canvas */}
      <canvas ref={confettiRef} style={styles.confetti} aria-hidden />

      {!submitted ? (
        <div style={styles.card} className="fadeIn">
          <div style={styles.header}>
            <span style={styles.inviteChip}>You’re Invited</span>
            <h1 style={styles.title}>{eventName}</h1>
            <div style={styles.cross}>✝️</div>
            <p style={styles.subtitle}>{dateStr} • {venueStr}</p>
            <p style={styles.verse}>
              “For where two or three are gathered in my name, there am I among them.” — Matthew 18:20
            </p>
          </div>

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
            <button style={styles.button} onClick={() => respond("yes")}>✅ Yes</button>
            <button style={styles.button} onClick={() => respond("maybe")}>🤔 Maybe</button>
            <button style={styles.button} onClick={() => respond("no")}>❌ No</button>
          </div>

          <div style={styles.share}>
            <a href={links.wa} target="_blank" rel="noreferrer" style={styles.link}>📱 WhatsApp</a>{" "}
            <span style={{ opacity: 0.7 }}>•</span>{" "}
            <a href={links.sms} target="_blank" rel="noreferrer" style={styles.link}>💬 SMS</a>{" "}
            <span style={{ opacity: 0.7 }}>•</span>{" "}
            <a href={links.mail} target="_blank" rel="noreferrer" style={styles.link}>📧 Email</a>
          </div>
        </div>
      ) : (
        <div style={styles.thankyou} className="fadeIn">
          <div style={styles.bigIcon}>✨</div>
          <h2 style={{ margin: 0 }}>Thank You!</h2>
          <p style={{ margin: "8px 0 18px" }}>{message}</p>
          <button style={styles.cta} onClick={() => (window.location.href = "/")}>
            Return Home
          </button>
          <div style={{ marginTop: 12 }}>
            <a href="/" style={styles.backLink}>← Back to Invitation</a>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------
 * 🎨 Kingdom Encounter Theme — Warm Sunrise Edition
 * ------------------------------------------------------------ */
const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "linear-gradient(180deg, #F9C74F 0%, #F9844A 50%, #4A2C09 100%)",
    color: "#fff",
    fontFamily: '"Inter", system-ui',
  },
  bg: {
    position: "absolute",
    inset: 0,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    filter: "brightness(0.8)",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(249,199,79,0.7) 0%, rgba(249,132,74,0.55) 45%, rgba(74,44,9,0.75) 100%)",
    pointerEvents: "none",
  },
  confetti: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: 50,
  },
  card: {
    position: "relative",
    zIndex: 2,
    width: "min(92vw, 480px)",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(8px)",
    borderRadius: 18,
    padding: "34px 26px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.30)",
  },
  header: { marginBottom: 10 },
  inviteChip: {
    display: "inline-block",
    background: "rgba(255, 255, 255, 0.22)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    letterSpacing: "1.4px",
    textTransform: "uppercase",
  },
  title: {
    margin: "8px 0 4px",
    fontSize: "clamp(1.6rem, 2.2vw + 1.2rem, 2.6rem)",
    fontWeight: 800,
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  cross: { fontSize: 32, margin: "6px 0 4px" },
  subtitle: { margin: 0, opacity: 0.95, fontWeight: 600 },
  verse: { margin: "10px 0 16px", fontSize: 13, lineHeight: 1.4, opacity: 0.9 },

  input: {
    width: "100%",
    padding: 12,
    margin: "8px 0",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    background: "#fff",
    color: "#4A2C09",
    outline: "none",
  },
  choices: { marginTop: 12, display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" },
  button: {
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 16,
    fontWeight: 800,
    background: "#FFD166",
    color: "#4A2C09",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    transition: "transform 0.12s ease, filter 0.2s ease",
  },

  share: { marginTop: 22, fontSize: 15, opacity: 0.95 },
  link: { color: "#fff", textDecoration: "none", fontWeight: 600 },

  thankyou: {
    position: "relative",
    zIndex: 2,
    width: "min(92vw, 480px)",
    background: "rgba(255,255,255,0.94)",
    color: "#4A2C09",
    borderRadius: 18,
    padding: "36px 26px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.30)",
  },
  bigIcon: { fontSize: 64, marginBottom: 8 },
  cta: {
    background: "linear-gradient(90deg, #F9C74F, #F9844A)",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
  },
  backLink: { color: "#9b5b00", fontWeight: 700, textDecoration: "none" },
};
