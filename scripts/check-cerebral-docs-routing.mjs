import fs from "node:fs";
import path from "node:path";

// Content-drift check (same must/mustNot pattern as check-cerebral-drift.mjs and
// check-opportunity-hq-drift.mjs) scoped to the docs and diagram this PR edited when it
// consolidated sales-outreach/outbound-strategist into agency-growth and
// content-creator/linkedin-content-creator/instagram-curator/podcast-strategist into
// offer-proof-content.

const root = process.cwd();

const checks = [
  {
    file: "docs/integration-map.md",
    must: [
      "offer-proof-content\n  Owns active SSystems proof-led social/content work. Platform-specific Agency wrappers are preserved but disabled from normal routing.",
      "agency-growth\n  Owns direct B2B positioning, offer clarity, portfolio-led messaging, target-specific outreach, and objections.",
      "Upwork / Fiverr / freelance post\n  -> freelance-gig-proposals",
      "Direct B2B lead / cold email / prospecting\n  -> agency-growth",
      "mentions: upwork, fiverr, proposal, client post, freelance, gig\n  load: freelance-gig-proposals",
      "mentions: direct lead, cold email, outbound, ICP, objection\n  load: agency-growth",
      "website copy / section wording\n  -> docs/offer/confirmed-copy.md, singleton-systems, offer-proof-content",
      "cover-letter-casual, freelance-gig-proposals, or agency-growth",
      "before website copy edits\n  load singleton-systems and offer-proof-content.",
    ],
    mustNot: [
      "linkedin-content-creator / instagram-curator / podcast-strategist\n  Use when portfolio needs to become platform-specific content.",
      "sales-outreach / outbound-strategist\n  Own outbound positioning",
      "-> freelance-gig-proposals + sales-outreach",
      "load: freelance-gig-proposals, sales-outreach, singleton-systems",
      "docs/offer/confirmed-copy.md, singleton-systems, content-creator, sales-outreach",
      "cover-letter-casual, freelance-gig-proposals, or sales-outreach",
      "load singleton-systems and content-creator.",
    ],
  },
  {
    file: "docs/operating-system/phase-one-operating-system.md",
    must: [
      "`offer-proof-content` for copy, sections, portfolio framing, and proof-led content strategy",
      "`agency-growth` for direct B2B pain, CTA, objection handling, and conversion logic",
      "- `offer-proof-content`\n- `podcast-strategist` is preserved for its specialist Chinese-podcast workflow and disabled from normal SSystems routing",
      "- primary: `offer-proof-content`\n- secondary: `agency-growth`",
      "### Sales And Pipeline\n\n- primary: `agency-growth`",
    ],
    mustNot: [
      "`content-creator` for copy, sections, portfolio framing, and content strategy",
      "`sales-outreach` for pain, CTA, objection handling, and conversion logic",
      "Use `sales-outreach` for:",
      "- `content-creator`\n- `linkedin-content-creator`\n- `instagram-curator`\n- `podcast-strategist`",
      "- primary: `content-creator`\n- secondary: `sales-outreach`",
      "- primary: `sales-outreach`\n- secondary: `outbound-strategist`",
    ],
  },
  {
    file: "docs/planning/planning-idea-routing-research-pass.md",
    must: [
      "Platform-specific post -> offer-proof-content; an explicitly requested specialist wrapper may be used only when its focused workflow is needed",
      "Direct B2B outreach copy -> agency-growth",
    ],
    mustNot: [
      "Platform-specific post -> LinkedIn / Instagram skill, or content-creator for X/TikTok until dedicated skills exist",
      "Outreach copy -> sales-outreach",
    ],
  },
  {
    file: "docs/diagrams/opportunity-hq-goal-check-in.drawio",
    must: [
      'id="skill-upwork" value="Upwork / Fiverr / gigs&#xa;&#xa;freelance-gig-proposals&#xa;Final Human Pass&#xa;research pending note"',
    ],
    mustNot: ["sales-outreach"],
  },
];

const errors = [];

for (const check of checks) {
  const filePath = path.join(root, check.file);
  let text = "";
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    errors.push(`${check.file}: cannot read (${error.message})`);
    continue;
  }

  for (const snippet of check.must) {
    if (!text.includes(snippet)) {
      errors.push(`${check.file}: missing ${JSON.stringify(snippet)}`);
    }
  }

  for (const snippet of check.mustNot) {
    if (text.includes(snippet)) {
      errors.push(`${check.file}: stale ${JSON.stringify(snippet)}`);
    }
  }
}

if (errors.length) {
  console.error("Cerebral docs routing check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Cerebral docs routing check passed: ${checks.length} files verified.`);