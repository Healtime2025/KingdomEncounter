/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Any accidental direct calls to GAS get rerouted to your proxy
      {
        source: "/macros/:path*",                       // if someone uses /macros/... locally
        destination: "/api/proxy",
      },
      {
        source: "/proxy-to-gas",                        // optional helper path
        destination: "/api/proxy",
      },
    ];
  },
};
module.exports = nextConfig;
