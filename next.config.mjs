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
  /**
   * Multi-zone: Wemby Shot Lab lives in project `wemby-shot-lab`
   * (https://github.com/23Maestro/basketballgods.net) with basePath
   * `/wemby-shot-lab`. Landing page at `/` is unchanged.
   */
  async rewrites() {
    const wemby = "https://wemby-shot-lab.vercel.app";
    return {
      beforeFiles: [
        {
          source: "/wemby-shot-lab",
          destination: `${wemby}/wemby-shot-lab`,
        },
        {
          source: "/wemby-shot-lab/:path*",
          destination: `${wemby}/wemby-shot-lab/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
