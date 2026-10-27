/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    localPatterns: [
      { pathname: "/projects/**" },
      { pathname: "/**", search: "" },
    ],
  },
};

export default nextConfig;
