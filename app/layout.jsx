// app/layout.jsx
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata = {
  title: "Kingdom Encounter — RSVP",
  description: "You're invited!",
};

// 👑 Load Inter font (with fallback)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const dynamic = "force-dynamic"; // prevent blank screens on Vercel

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#F9C74F" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
      </head>
      <body>
        {children}

        {/* 🌅 Global Royal Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #__next {
                min-height: 100%;
                margin: 0;
                padding: 0;
              }

              body {
                background: linear-gradient(180deg, #F9C74F 0%, #F9844A 50%, #4A2C09 100%) fixed;
                color: #fff;
                font-family: var(--font-inter), system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
                overflow-x: hidden;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
              }

              a {
                color: inherit;
                text-decoration: none;
              }

              button {
                font-family: inherit;
              }

              .blue, .royal, .royal-bg, .bg-primary {
                background: transparent !important;
              }

              #statsBar, [data-stats-bar], .stats, .counts {
                display: none !important;
                visibility: hidden !important;
              }

              /* ✨ Soft breathing glow for elegance */
              body::before {
                content: "";
                position: fixed;
                inset: 0;
                background: radial-gradient(circle at 50% 20%, rgba(255,255,255,0.08), transparent 60%);
                animation: royalGlow 6s ease-in-out infinite alternate;
                pointer-events: none;
              }

              @keyframes royalGlow {
                from { opacity: 0.4; }
                to { opacity: 0.9; }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
