/**
 * Bakes the Four Fulfillment Paths flow geometry with JointJS Core.
 *
 * JointFlowLayer.tsx drives JointJS from React `useLayoutEffect`, which is a
 * hard blocker for the port: HyperFrames seeks frames, it does not run a React
 * lifecycle. The lint rule's own remedy is "move the side-effect work into a
 * build step", so that is exactly what this does — JointJS Core still owns the
 * graph geometry (anchors, routers, rounded connectors), it just resolves once
 * here instead of on every render.
 *
 * Output: geometry.json, a list of { id, d } SVG paths the composition draws
 * with stroke-dashoffset on the single paused timeline.
 *
 *   node bake-joint-geometry.mjs
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../../..");
const jointSrc = readFileSync(resolve(repo, "node_modules/@joint/core/dist/joint.min.js"), "utf8");

// canvasWidth / canvasHeight as passed by FourFulfillmentPaths.tsx
const WIDTH = 1224;
const HEIGHT = 520;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body><div id="host"></div></body></html>');
await page.addScriptTag({ content: jointSrc });

const paths = await page.evaluate(
  ({ width, height }) => {
    const { dia, shapes } = window.joint;

    // --- verbatim from FourFulfillmentPaths.tsx: fulfillmentFlowLayout ---
    const targetStart = 170;
    const cardGap = 18;
    const cardWidth = (width - targetStart - cardGap) / 2;
    const cardHeight = 220;
    const rowGap = 18;
    const top = (height - cardHeight * 2 - rowGap) / 2;
    const secondColumn = targetStart + cardWidth + cardGap;
    const hubRight = 116;
    const center = height / 2;
    const topCenter = top + cardHeight / 2;
    const bottomCenter = top + cardHeight + rowGap + cardHeight / 2;
    const firstLane = targetStart - 24;
    const secondLane = secondColumn - 24;

    const layout = {
      nodes: [
        { id: "seller-entry", x: -2, y: height / 2 - 2, width: 4, height: 4 },
        { id: "route-hub", x: 68, y: height / 2 - 24, width: 48, height: 48 },
        { id: "wholesale", x: targetStart, y: top, width: cardWidth, height: cardHeight },
        { id: "investor-partner", x: secondColumn, y: top, width: cardWidth, height: cardHeight },
        {
          id: "ibuyer-platform",
          x: targetStart,
          y: top + cardHeight + rowGap,
          width: cardWidth,
          height: cardHeight,
        },
        {
          id: "buy-it-yourself",
          x: secondColumn,
          y: top + cardHeight + rowGap,
          width: cardWidth,
          height: cardHeight,
        },
      ],
      edges: [
        { id: "entry-to-hub", source: "seller-entry", target: "route-hub" },
        {
          id: "hub-to-wholesale",
          source: "route-hub",
          target: "wholesale",
          vertices: [
            { x: firstLane, y: center },
            { x: firstLane, y: topCenter },
          ],
        },
        {
          id: "hub-to-investor",
          source: "route-hub",
          target: "investor-partner",
          vertices: [
            { x: hubRight + 18, y: center },
            { x: secondLane, y: center },
            { x: secondLane, y: topCenter },
          ],
        },
        {
          id: "hub-to-ibuyer",
          source: "route-hub",
          target: "ibuyer-platform",
          vertices: [
            { x: firstLane, y: center },
            { x: firstLane, y: bottomCenter },
          ],
        },
        {
          id: "hub-to-purchase",
          source: "route-hub",
          target: "buy-it-yourself",
          vertices: [
            { x: hubRight + 18, y: center },
            { x: secondLane, y: center },
            { x: secondLane, y: bottomCenter },
          ],
        },
      ],
    };

    // --- verbatim from JointFlowLayer.tsx ---
    const anchorPoint = (node, anchor) => {
      if (anchor === "left") return { x: node.x, y: node.y + node.height / 2 };
      if (anchor === "top") return { x: node.x + node.width / 2, y: node.y };
      if (anchor === "bottom") return { x: node.x + node.width / 2, y: node.y + node.height };
      return { x: node.x + node.width, y: node.y + node.height / 2 };
    };

    const graph = new dia.Graph({}, { cellNamespace: shapes });
    const paper = new dia.Paper({
      el: document.getElementById("host"),
      model: graph,
      width,
      height,
      cellViewNamespace: shapes,
      interactive: false,
      async: false,
      frozen: true,
      background: { color: "transparent" },
    });

    const nodeById = new Map(layout.nodes.map((n) => [n.id, n]));
    const nodes = layout.nodes.map(
      (node) =>
        new shapes.standard.Rectangle({
          id: node.id,
          position: { x: node.x, y: node.y },
          size: { width: node.width, height: node.height },
          attrs: { body: { fill: "transparent", stroke: "none" }, label: { display: "none" } },
        }),
    );

    const cornerRadius = 12;
    const obstaclePadding = 6;
    const links = layout.edges.map((edge) => {
      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      const sourceAnchor = edge.sourceAnchor ?? "right";
      const targetAnchor = edge.targetAnchor ?? "left";
      return new shapes.standard.Link({
        id: edge.id,
        source: anchorPoint(sourceNode, sourceAnchor),
        target: anchorPoint(targetNode, targetAnchor),
        vertices: edge.vertices,
        router: edge.vertices
          ? { name: "normal" }
          : {
              name: "manhattan",
              args: {
                padding: obstaclePadding,
                step: 6,
                startDirections: [sourceAnchor],
                endDirections: [targetAnchor],
              },
            },
        connector: { name: "rounded", args: { radius: cornerRadius } },
        attrs: { line: { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } },
      });
    });

    graph.resetCells([...nodes, ...links]);
    paper.unfreeze();

    // read the geometry JointJS resolved
    return links.map((link) => {
      const view = link.findView(paper);
      return { id: link.id, d: view.getConnection().serialize() };
    });
  },
  { width: WIDTH, height: HEIGHT },
);

await browser.close();

const out = { width: WIDTH, height: HEIGHT, generatedBy: "@joint/core", paths };
writeFileSync(resolve(here, "geometry.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`baked ${paths.length} paths -> geometry.json`);
for (const p of paths) console.log(`  ${p.id}: ${p.d}`);
