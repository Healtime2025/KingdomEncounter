/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      // ✅ Redirect any accidental direct Google Apps Script calls to your secure proxy
      {
        source: "/macros/:path*",
        destination: "/api/proxy",
      },
      {
        source: "/proxy-to-gas",
        destination: "/api/proxy",
      },
    ];
  },

  // ✅ Ensure Next.js uses the App Router correctly (for /app directory)
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
