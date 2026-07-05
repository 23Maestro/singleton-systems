/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/c4",
        destination: "/visual-maps/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
