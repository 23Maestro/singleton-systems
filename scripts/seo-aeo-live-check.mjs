import { chromium } from "playwright";

const targetUrl = process.env.SEO_AEO_URL || process.argv[2] || "https://singleton-systems.com";
const requiredPaths = ["/", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/icon.svg"];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchText(pathname) {
  const url = new URL(pathname, targetUrl);
  const response = await fetch(url, { redirect: "follow" });
  return {
    url: response.url,
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    text: await response.text(),
  };
}

const responses = Object.fromEntries(
  await Promise.all(requiredPaths.map(async (path) => [path, await fetchText(path)])),
);

for (const path of requiredPaths) {
  assert(responses[path].status === 200, `${path} returned ${responses[path].status}`);
}

const home = responses["/"].text;

const requiredSnippets = [
  "<title>Jerami Singleton | Workflow Cleanup Consultant</title>",
  'name="description"',
  'rel="canonical"',
  'property="og:title"',
  'name="twitter:card"',
  'type="application/ld+json"',
  '"@type":"FAQPage"',
  '"@type":"Service"',
];

for (const snippet of requiredSnippets) {
  assert(home.includes(snippet), `Missing required snippet: ${snippet}`);
}

assert(!home.includes("app.cal.com/embed/embed.js"), "Cal.com embed script is present on initial HTML");
assert(responses["/robots.txt"].text.includes("Sitemap: https://singleton-systems.com/sitemap.xml"), "robots.txt does not advertise sitemap");
assert(responses["/sitemap.xml"].text.includes("<loc>https://singleton-systems.com</loc>"), "sitemap.xml missing homepage loc");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleMessages = [];

page.on("console", (message) => {
  if (["error", "warning"].includes(message.type())) {
    consoleMessages.push({ type: message.type(), text: message.text() });
  }
});

page.on("pageerror", (error) => {
  consoleMessages.push({ type: "pageerror", text: error.message });
});

await page.goto(targetUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const runtime = await page.evaluate(() => {
  const scripts = [...document.scripts].map((script) => ({
    src: script.src,
    dataset: { ...script.dataset },
  }));
  const jsonLdText = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((script) => script.textContent ?? "")
    .join("\n");
  const bodyText = document.body.innerText;

  return {
    title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    h1Text: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
    h1Label: document.querySelector("h1")?.getAttribute("aria-label") ?? null,
    h1Count: document.querySelectorAll("h1").length,
    jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
    hasJsonLdFaq: jsonLdText.includes('"@type":"FAQPage"') || jsonLdText.includes('"@type": "FAQPage"'),
    hasJsonLdService: jsonLdText.includes('"@type":"Service"') || jsonLdText.includes('"@type": "Service"'),
    hasVisibleAeoBlock: bodyText.includes("Answers for the way buyers search now"),
    hasInitialCalEmbed: scripts.some((script) => script.src.includes("app.cal.com/embed/embed.js")),
    speedInsightScripts: scripts.filter((script) => script.dataset.sdkn?.includes("speed-insights")),
    googleVerificationPresent: Boolean(document.querySelector('meta[name="google-site-verification"]')),
    bingVerificationPresent: Boolean(document.querySelector('meta[name="msvalidate.01"]')),
  };
});

await browser.close();

assert(consoleMessages.length === 0, `Browser console has ${consoleMessages.length} errors/warnings`);
assert(runtime.title === "Jerami Singleton | Workflow Cleanup Consultant", "Hydrated title mismatch");
assert(runtime.canonical === "https://singleton-systems.com/", "Hydrated canonical mismatch");
const h1AccessibleText = runtime.h1Label || runtime.h1Text;

assert(h1AccessibleText?.includes("Time"), `Hydrated H1 missing Time: ${h1AccessibleText}`);
assert(h1AccessibleText?.includes("before the work ships."), `Hydrated H1 missing ending: ${h1AccessibleText}`);
assert(!h1AccessibleText?.includes("disappears"), `Hydrated H1 contains legacy word: ${h1AccessibleText}`);
assert(
  ["vanishes", "dissolves", "unravels"].some((word) => h1AccessibleText?.includes(word)),
  `Hydrated H1 missing rotating words: ${h1AccessibleText}`,
);
assert(runtime.h1Count === 1, `Expected 1 H1, found ${runtime.h1Count}`);
assert(runtime.jsonLdCount >= 1, "Hydrated page missing JSON-LD");
assert(runtime.hasJsonLdFaq, "Hydrated page missing FAQPage JSON-LD");
assert(runtime.hasJsonLdService, "Hydrated page missing Service JSON-LD");
assert(!runtime.hasVisibleAeoBlock, "Visible AEO answer block should not be on the page");
assert(!runtime.hasInitialCalEmbed, "Cal.com embed script loaded before user interaction");
assert(runtime.speedInsightScripts.length >= 1, "Vercel Speed Insights script did not inject after hydration");

const summary = {
  targetUrl,
  endpoints: Object.fromEntries(
    Object.entries(responses).map(([path, response]) => [
      path,
      {
        status: response.status,
        contentType: response.contentType,
        url: response.url,
      },
    ]),
  ),
  metadata: {
    title: true,
    description: true,
    canonical: true,
    openGraph: true,
    twitter: true,
    jsonLd: true,
    visibleAeo: false,
    initialCalEmbed: false,
  },
  runtime: {
    title: runtime.title,
    canonical: runtime.canonical,
    h1Text: runtime.h1Text,
    h1Label: runtime.h1Label,
    h1Count: runtime.h1Count,
    jsonLdCount: runtime.jsonLdCount,
    jsonLdFaq: runtime.hasJsonLdFaq,
    jsonLdService: runtime.hasJsonLdService,
    visibleAeoBlock: runtime.hasVisibleAeoBlock,
    initialCalEmbed: runtime.hasInitialCalEmbed,
    speedInsights: runtime.speedInsightScripts.map((script) => ({
      src: script.src,
      sdkn: script.dataset.sdkn,
      sdkv: script.dataset.sdkv,
      route: script.dataset.route,
      endpoint: script.dataset.endpoint,
    })),
    googleVerificationPresent: runtime.googleVerificationPresent,
    bingVerificationPresent: runtime.bingVerificationPresent,
    consoleMessages,
  },
};

console.log(JSON.stringify(summary, null, 2));
