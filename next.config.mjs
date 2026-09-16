/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
  reactStrictMode: true,
  async headers() {
    const privateRoutePatterns = [
      "/ai-workflow-portfolio/:path*",
      "/ai-workflow-session/:path*",
      "/decision-maps/:path*",
      "/finances/:path*",
      "/finances-form/:path*",
      "/finances-plan/:path*",
      "/flowzone/:path*",
      "/futurevoices/:path*",
      "/home-tasks/:path*",
      "/linear-inbox/:path*",
      "/links/:path*",
      "/portfolio-c4-plan/:path*",
      "/rouse-and-holder/:path*",
      "/visual-maps/:path*",
      "/wemby-shot-lab/:path*",
      "/c4",
    ];

    return privateRoutePatterns.map((source) => ({
      source,
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow",
        },
      ],
    }));
  },
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
          source: "/decision-maps/2026-09-15-kedasha-preview",
          destination: "/decision-maps/2026-09-15-kedasha-preview/index.html",
        },
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
