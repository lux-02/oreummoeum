/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["ko"],
    defaultLocale: "ko",
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "tong.visitkorea.or.kr",
        port: "",
        pathname: "/cms/resource/**",
      },
      {
        protocol: "https",
        hostname: "tong.visitkorea.or.kr",
        port: "",
        pathname: "/cms/resource/**",
      },
    ],
  },
};

export default nextConfig;
