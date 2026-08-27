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
    const flowzone = "https://flowzone-23maestros-projects.vercel.app";
    return {
      beforeFiles: [
        {
          source: "/futurevoices",
          destination: "/decision-maps/2026-08-14-future-voices-storyboard/index.html",
        },
        {
          source: "/wemby-shot-lab",
          destination: `${wemby}/wemby-shot-lab`,
        },
        {
          source: "/wemby-shot-lab/:path*",
          destination: `${wemby}/wemby-shot-lab/:path*`,
        },
        {
          source: "/flowzone",
          destination: `${flowzone}/flowzone`,
        },
        {
          source: "/flowzone/:path*",
          destination: `${flowzone}/flowzone/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
