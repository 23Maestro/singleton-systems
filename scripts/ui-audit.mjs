import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const targetUrl = process.argv[2] || process.env.UI_AUDIT_URL || "http://localhost:3000";
const startedAt = new Date();
const runId = startedAt.toISOString().replace(/[:.]/g, "-");
const auditRoot = path.join(process.cwd(), "output", "ui-audit");
const outDir = path.join(auditRoot, runId);

const viewports = [
  { name: "desktop", width: 2048, height: 1152 },
  { name: "mobile", width: 390, height: 844 },
];

const cardTitles = ["Intake & Scope", "Assets & Folders", "Notes & Reviews", "Package & Delivery"];

function roundRect(rect) {
  if (!rect) return null;
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    left: Math.round(rect.left),
  };
}

function relativeMetrics(container, element) {
  if (!container || !element) return null;
  const cr = container.getBoundingClientRect();
  const er = element.getBoundingClientRect();
  return {
    leftInset: Math.round(er.left - cr.left),
    rightInset: Math.round(cr.right - er.right),
    topInset: Math.round(er.top - cr.top),
    bottomInset: Math.round(cr.bottom - er.bottom),
    overflowLeft: Math.max(0, Math.round(cr.left - er.left)),
    overflowRight: Math.max(0, Math.round(er.right - cr.right)),
    overflowTop: Math.max(0, Math.round(cr.top - er.top)),
    overflowBottom: Math.max(0, Math.round(er.bottom - cr.bottom)),
    widthDelta: Math.round(cr.width - er.width),
    heightDelta: Math.round(cr.height - er.height),
  };
}

function cssPath(element) {
  const parts = [];
  let current = element;

  while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const id = current.id ? `#${CSS.escape(current.id)}` : "";
    if (id) {
      parts.unshift(`${tag}${id}`);
      break;
    }

    const parent = current.parentElement;
    if (!parent) {
      parts.unshift(tag);
      break;
    }

    const siblings = [...parent.children].filter((child) => child.tagName === current.tagName);
    const nth = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : "";
    parts.unshift(`${tag}${nth}`);
    current = parent;
  }

  return parts.join(" > ");
}

function textFor(element) {
  const text = element.innerText || element.textContent || element.getAttribute("aria-label") || "";
  return text.replace(/\s+/g, " ").trim().slice(0, 120);
}

function visibleClipping(root) {
  return [...root.querySelectorAll("*")]
    .filter((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1 || style.visibility === "hidden" || style.display === "none") {
        return false;
      }
      return element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
    })
    .slice(0, 30)
    .map((element) => ({
      selector: cssPath(element),
      text: textFor(element),
      clientWidth: Math.round(element.clientWidth),
      scrollWidth: Math.round(element.scrollWidth),
      clientHeight: Math.round(element.clientHeight),
      scrollHeight: Math.round(element.scrollHeight),
      overflowX: window.getComputedStyle(element).overflowX,
      overflowY: window.getComputedStyle(element).overflowY,
    }));
}

async function collectViewport(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForFunction(() => {
    const probe = document.createElement("div");
    probe.className = "hidden rounded-[2rem] px-7";
    document.body.appendChild(probe);
    const style = window.getComputedStyle(probe);
    const cssApplied = style.display === "none" && style.paddingLeft === "28px" && style.borderTopLeftRadius === "32px";
    probe.remove();
    return cssApplied;
  });
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const screenshotPath = path.join(outDir, `${viewport.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false, scale: "css" });

  const geometry = await page.evaluate(
    ({ cardTitles }) => {
      function roundRect(rect) {
        if (!rect) return null;
        return {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          left: Math.round(rect.left),
        };
      }

      function relativeMetrics(container, element) {
        if (!container || !element) return null;
        const cr = container.getBoundingClientRect();
        const er = element.getBoundingClientRect();
        return {
          leftInset: Math.round(er.left - cr.left),
          rightInset: Math.round(cr.right - er.right),
          topInset: Math.round(er.top - cr.top),
          bottomInset: Math.round(cr.bottom - er.bottom),
          overflowLeft: Math.max(0, Math.round(cr.left - er.left)),
          overflowRight: Math.max(0, Math.round(er.right - cr.right)),
          overflowTop: Math.max(0, Math.round(cr.top - er.top)),
          overflowBottom: Math.max(0, Math.round(er.bottom - cr.bottom)),
          widthDelta: Math.round(cr.width - er.width),
          heightDelta: Math.round(cr.height - er.height),
        };
      }

      function cssPath(element) {
        const parts = [];
        let current = element;

        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
          const tag = current.tagName.toLowerCase();
          const id = current.id ? `#${CSS.escape(current.id)}` : "";
          if (id) {
            parts.unshift(`${tag}${id}`);
            break;
          }

          const parent = current.parentElement;
          if (!parent) {
            parts.unshift(tag);
            break;
          }

          const siblings = [...parent.children].filter((child) => child.tagName === current.tagName);
          const nth = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : "";
          parts.unshift(`${tag}${nth}`);
          current = parent;
        }

        return parts.join(" > ");
      }

      function textFor(element) {
        const text = element.innerText || element.textContent || element.getAttribute("aria-label") || "";
        return text.replace(/\s+/g, " ").trim().slice(0, 120);
      }

      function visibleClipping(root) {
        return [...root.querySelectorAll("*")]
          .filter((element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            if (rect.width < 1 || rect.height < 1 || style.visibility === "hidden" || style.display === "none") {
              return false;
            }
            return element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
          })
          .slice(0, 30)
          .map((element) => ({
            selector: cssPath(element),
            text: textFor(element),
            clientWidth: Math.round(element.clientWidth),
            scrollWidth: Math.round(element.scrollWidth),
            clientHeight: Math.round(element.clientHeight),
            scrollHeight: Math.round(element.scrollHeight),
            overflowX: window.getComputedStyle(element).overflowX,
            overflowY: window.getComputedStyle(element).overflowY,
          }));
      }

      const cards = [...document.querySelectorAll("article")].filter((article) => {
        const title = article.querySelector("h3")?.textContent?.trim();
        return title && cardTitles.includes(title);
      });

      return cards.map((card, index) => {
        const title = card.querySelector("h3")?.textContent?.trim() || `Card ${index + 1}`;
        const visual = [...card.children].find((child) => String(child.className).includes("mt-8")) || card.lastElementChild;
        const visualRect = visual?.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const productElements =
          title === "Package & Delivery"
            ? [...(visual?.firstElementChild?.children || [])].slice(0, 2)
            : [visual?.querySelector(":scope > div:last-child") || visual?.firstElementChild].filter(Boolean);

        return {
          index: index + 1,
          title,
          card: roundRect(cardRect),
          visual: roundRect(visualRect),
          cardToVisual: relativeMetrics(card, visual),
          productUi: productElements.map((element, productIndex) => ({
            name:
              title === "Package & Delivery"
                ? productIndex === 0
                  ? "Reusable Template back card"
                  : "Final Handoff front card"
                : "Product UI",
            rect: roundRect(element.getBoundingClientRect()),
            visualRelative: relativeMetrics(visual, element),
            cardRelative: relativeMetrics(card, element),
          })),
          clippedElements: visibleClipping(card),
        };
      });
    },
    { cardTitles },
  );

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  return {
    viewport,
    screenshot: path.relative(process.cwd(), screenshotPath),
    geometry,
    accessibility: {
      violations: axe.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          failureSummary: node.failureSummary,
          html: node.html.slice(0, 240),
        })),
      })),
    },
  };
}

function markdownReport(results) {
  const lines = [
    "# UI Audit Report",
    "",
    `- URL: ${targetUrl}`,
    `- Run: ${startedAt.toISOString()}`,
    "",
  ];

  for (const result of results) {
    lines.push(`## ${result.viewport.name} (${result.viewport.width}x${result.viewport.height})`, "");
    lines.push(`- Screenshot: \`${result.screenshot}\``);
    lines.push(`- Accessibility violations: ${result.accessibility.violations.length}`, "");

    for (const card of result.geometry) {
      lines.push(`### Card ${card.index}: ${card.title}`);
      lines.push(
        `- Card: ${card.card.width}x${card.card.height}; visual: ${card.visual.width}x${card.visual.height}; visual bottom gap: ${card.cardToVisual.bottomInset}px`,
      );
      for (const product of card.productUi) {
        lines.push(
          `- ${product.name}: ${product.rect.width}x${product.rect.height}; visual right inset ${product.visualRelative.rightInset}px; visual bottom inset ${product.visualRelative.bottomInset}px; overflow R/B ${product.visualRelative.overflowRight}px/${product.visualRelative.overflowBottom}px`,
        );
      }
      if (card.clippedElements.length) {
        lines.push(`- Potential clipped elements: ${card.clippedElements.length}`);
        for (const clipped of card.clippedElements.slice(0, 5)) {
          lines.push(`  - \`${clipped.selector}\`: "${clipped.text}" (${clipped.clientWidth}x${clipped.clientHeight} client, ${clipped.scrollWidth}x${clipped.scrollHeight} scroll)`);
        }
      } else {
        lines.push("- Potential clipped elements: 0");
      }
      lines.push("");
    }

    if (result.accessibility.violations.length) {
      lines.push("### Accessibility Findings");
      for (const violation of result.accessibility.violations) {
        lines.push(`- ${violation.impact || "unknown"}: ${violation.id} - ${violation.help}`);
        for (const node of violation.nodes.slice(0, 5)) {
          lines.push(`  - ${node.target.join(", ")}`);
        }
      }
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}

await rm(auditRoot, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = [];
  for (const viewport of viewports) {
    results.push(await collectViewport(page, viewport));
  }

  const jsonPath = path.join(outDir, "report.json");
  const markdownPath = path.join(outDir, "report.md");
  await writeFile(jsonPath, `${JSON.stringify({ targetUrl, startedAt: startedAt.toISOString(), results }, null, 2)}\n`);
  await writeFile(markdownPath, markdownReport(results));

  console.log(`UI audit complete: ${path.relative(process.cwd(), outDir)}`);
  console.log(`JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Markdown: ${path.relative(process.cwd(), markdownPath)}`);
  for (const result of results) {
    console.log(`${result.viewport.name}: ${result.screenshot}, ${result.accessibility.violations.length} accessibility violation(s)`);
  }
  await context.close();
} finally {
  await browser.close();
}
