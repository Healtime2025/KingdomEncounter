"use client"; // 👑 Required for styled-jsx in Next.js 14+

export const metadata = {
  title: "Kingdom Encounter — RSVP",
  description: "You're invited!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* GLOBAL OVERRIDES: kill legacy blue + stats anywhere */}
        <style jsx global>{`
          html,
          body,
          #__next {
            min-height: 100%;
          }
          body {
            background: linear-gradient(
              180deg,
              #F9C74F 0%,
              #F9844A 50%,
              #4A2C09 100%
            ) !important;
            background-attachment: fixed !important;
            color: #fff;
            font-family: "Inter", system-ui, -apple-system, Segoe UI, Roboto,
              "Helvetica Neue", Arial;
          }
          .blue, .royal, .royal-bg, .bg-primary { background: transparent !important; }
          #statsBar, [data-stats-bar], .stats, .counts {
            display: none !important; visibility: hidden !important;
          }
        `}</style>
      </body>
    </html>
  );
}
