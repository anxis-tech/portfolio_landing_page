/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    localPatterns: [
      { pathname: "/projects/**" },
      { pathname: "/**", search: "" },
    ],
  },
};

export default nextConfig;
