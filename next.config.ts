/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 1. Fix the deprecation warning
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      // Keep your Clerk pattern if you have it:
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    // 2. Fix the SVG "dangerouslyAllowSVG" error
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
