"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TabTarget = "System" | "Evidence" | "AI Specialist" | "Resume" | "Proof Map";
type VisualType = "Raycast" | "Cards" | "Data Table" | "Flowchart" | "Review Panel" | "Diff View" | "Code Map";
type InteractionMode = "Static" | "Clickable" | "Modal" | "Step-through";
type Density = "Compact" | "Balanced" | "Spacious";
type Tone = "Portfolio" | "Executive" | "Technical";
type Theme = "Light" | "Dark" | "Mixed";
type RouterValue = "normal" | "orthogonal" | "manhattan";
type ConnectorValue = "normal" | "rounded" | "smooth";
type Layer = "command" | "bridge" | "truth" | "proof" | "public";
type JointNamespace = typeof import("@joint/core");
type CanvasCell = {
  attr: (path: string, value?: unknown) => void;
};
type CanvasLinkCell = CanvasCell & {
  router: (name: string, args?: Record<string, unknown>) => void;
  connector: (name: string, args?: Record<string, unknown>) => void;
};

type NodeDefinition = {
  id: string;
  label: string;
  detail: string;
  layer: Layer;
  x: number;
  y: number;
};

type LinkDefinition = {
  id: string;
  source: string;
  target: string;
  label: string;
  type: "routes" | "reads" | "packages" | "verifies" | "publishes";
};

const nodes: NodeDefinition[] = [
  { id: "command", label: "Raycast command surface", detail: "Native action first. Codex assist second.", layer: "command", x: 70, y: 80 },
  { id: "adapter", label: "Adapter / API bridge", detail: "Turns repeated workflow behavior into stable request shapes.", layer: "bridge", x: 320, y: 74 },
  { id: "truth", label: "Supabase truth layer", detail: "Durable facts only after repetition proves the fields.", layer: "truth", x: 570, y: 92 },
  { id: "router", label: "Evidence router", detail: "Files, notes, screenshots, and shipped proof get routed before claims.", layer: "proof", x: 88, y: 308 },
  { id: "portfolio", label: "Portfolio command page", detail: "Front-facing proof surface with Raycast-style interaction.", layer: "public", x: 334, y: 286 },
  { id: "checker", label: "Claim checker", detail: "Review copy against evidence before anything moves public.", layer: "proof", x: 588, y: 316 },
  { id: "resume", label: "Resume proof stack", detail: "Role-fit packet supported by concrete systems and outputs.", layer: "public", x: 340, y: 522 },
];

const links: LinkDefinition[] = [
  { id: "command-adapter", source: "command", target: "adapter", label: "launches", type: "routes" },
  { id: "adapter-truth", source: "adapter", target: "truth", label: "reads / writes", type: "reads" },
  { id: "router-command", source: "router", target: "command", label: "routes", type: "routes" },
  { id: "router-portfolio", source: "router", target: "portfolio", label: "packages", type: "packages" },
  { id: "portfolio-checker", source: "portfolio", target: "checker", label: "verifies", type: "verifies" },
  { id: "checker-truth", source: "checker", target: "truth", label: "confirms", type: "reads" },
  { id: "portfolio-resume", source: "portfolio", target: "resume", label: "supports", type: "publishes" },
];

const layerMeta = {
  command: { label: "Command", color: "#ff6363", soft: "rgba(255,99,99,0.15)" },
  bridge: { label: "Bridge", color: "#60a5fa", soft: "rgba(96,165,250,0.15)" },
  truth: { label: "Truth", color: "#34d399", soft: "rgba(52,211,153,0.15)" },
  proof: { label: "Proof", color: "#a78bfa", soft: "rgba(167,139,250,0.15)" },
  public: { label: "Public", color: "#facc15", soft: "rgba(250,204,21,0.15)" },
} satisfies Record<Layer, { label: string; color: string; soft: string }>;

const presets = {
  Full: ["command", "bridge", "truth", "proof", "public"],
  "Proof path": ["command", "proof", "public"],
  "Data path": ["command", "bridge", "truth"],
  "Portfolio path": ["proof", "public"],
} satisfies Record<string, Layer[]>;

const tabTargets: TabTarget[] = ["System", "Evidence", "AI Specialist", "Resume", "Proof Map"];
const visualTypes: VisualType[] = ["Raycast", "Cards", "Data Table", "Flowchart", "Review Panel", "Diff View", "Code Map"];
const interactionModes: InteractionMode[] = ["Static", "Clickable", "Modal", "Step-through"];
const densities: Density[] = ["Compact", "Balanced", "Spacious"];
const tones: Tone[] = ["Portfolio", "Executive", "Technical"];
const themes: Theme[] = ["Light", "Dark", "Mixed"];
const defaultLayers: Record<Layer, boolean> = {
  command: true,
  bridge: true,
  truth: true,
  proof: true,
  public: true,
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function OptionGroup<T extends string>({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.14em] text-white/38">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cx(
              "min-h-8 rounded-lg border px-2.5 text-xs font-bold transition",
              value === option ? "border-white/25 bg-white text-black" : "border-white/12 bg-white/8 text-white/64 hover:bg-white/14",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function nextValue<T extends string>(values: readonly T[], current: T): T {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length] ?? values[0];
}

function routerConfig(router: RouterValue, gridSize: number) {
  if (router === "manhattan") return { name: router, args: { step: gridSize, padding: gridSize } };
  if (router === "orthogonal") return { name: router, args: { padding: 18 } };
  return { name: "normal" };
}

function connectorConfig(connector: ConnectorValue) {
  if (connector === "rounded") {
    return { name: "straight", args: { cornerType: "cubic", cornerRadius: 16, precision: 0 } };
  }
  if (connector === "normal") return { name: "straight" };
  return { name: "smooth" };
}

export default function JointWorkflowCodeMap() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<{ getElements: () => unknown[]; getLinks: () => unknown[] } | null>(null);
  const paperRef = useRef<{ remove?: () => void; setDimensions?: (width: number, height: number) => void; scaleContentToFit?: (options: Record<string, unknown>) => void } | null>(null);
  const elementMapRef = useRef<Map<string, CanvasCell>>(new Map());
  const linkMapRef = useRef<Map<string, CanvasLinkCell>>(new Map());

  const [tabTarget, setTabTarget] = useState<TabTarget>("Proof Map");
  const [visualType, setVisualType] = useState<VisualType>("Code Map");
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("Clickable");
  const [density, setDensity] = useState<Density>("Balanced");
  const [tone, setTone] = useState<Tone>("Technical");
  const [theme, setTheme] = useState<Theme>("Dark");
  const [router, setRouter] = useState<RouterValue>("manhattan");
  const [connector, setConnector] = useState<ConnectorValue>("rounded");
  const [selectedNode, setSelectedNode] = useState("portfolio");
  const [activePreset, setActivePreset] = useState<keyof typeof presets>("Full");
  const [activeLayers, setActiveLayers] = useState<Record<Layer, boolean>>(defaultLayers);
  const [copied, setCopied] = useState(false);

  const light = theme === "Light";
  const mixed = theme === "Mixed";
  const roomy = density === "Spacious";
  const compact = density === "Compact";
  const selected = nodes.find((node) => node.id === selectedNode) ?? nodes[4];

  const visibleNodeIds = useMemo(() => new Set(nodes.filter((node) => activeLayers[node.layer]).map((node) => node.id)), [activeLayers]);

  const prompt = useMemo(() => {
    const visibleLayers = Object.entries(activeLayers)
      .filter(([, enabled]) => enabled)
      .map(([layer]) => layerMeta[layer as Layer].label)
      .join(", ");

    return [
      `Build the ${tabTarget} tab using the ${visualType} visual direction.`,
      `Interaction: ${interactionMode}. Density: ${density}. Tone: ${tone}. Theme: ${theme}.`,
      `Use a JointJS code-map canvas with ${router} routing and ${connector} connectors.`,
      `Visible layers: ${visibleLayers}. Focus node: ${selected.label}.`,
      "Keep the page Raycast-like: command surface, detail pane, action bar, keyboard affordances, evidence before claims.",
    ].join("\n");
  }, [activeLayers, connector, density, interactionMode, router, selected.label, tabTarget, theme, tone, visualType]);

  const fitCanvas = useCallback(() => {
    const container = canvasRef.current;
    const paper = paperRef.current;
    if (!container || !paper) return;

    paper.setDimensions?.(Math.max(container.clientWidth, 340), compact ? 540 : roomy ? 720 : 640);
    requestAnimationFrame(() => {
      paper.scaleContentToFit?.({ padding: compact ? 22 : 34, maxScale: roomy ? 1.18 : 1.05, useModelGeometry: true });
    });
  }, [compact, roomy]);

  const applyHighlights = useCallback(
    (nodeId: string) => {
      elementMapRef.current.forEach((cell, id) => {
        const node = nodes.find((item) => item.id === id);
        const active = id === nodeId;
        const visible = node ? activeLayers[node.layer] : false;
        const meta = node ? layerMeta[node.layer] : layerMeta.public;
        cell.attr("body/opacity", visible ? (active ? 1 : 0.72) : 0.08);
        cell.attr("body/stroke", active ? "#ffffff" : meta.color);
        cell.attr("body/strokeWidth", active ? 3.2 : 1.8);
      });

      linkMapRef.current.forEach((cell, linkId) => {
        const link = links.find((item) => item.id === linkId);
        const visible = Boolean(link && visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target));
        const active = Boolean(link && (link.source === nodeId || link.target === nodeId));
        cell.attr("line/strokeOpacity", visible ? (active ? 1 : 0.24) : 0);
        cell.attr("line/strokeWidth", active ? 3.3 : 1.7);
      });
    },
    [activeLayers, visibleNodeIds],
  );

  const setPreset = (preset: keyof typeof presets) => {
    const nextLayers = new Set(presets[preset]);
    setActivePreset(preset);
    setActiveLayers({
      command: nextLayers.has("command"),
      bridge: nextLayers.has("bridge"),
      truth: nextLayers.has("truth"),
      proof: nextLayers.has("proof"),
      public: nextLayers.has("public"),
    });
    window.setTimeout(fitCanvas, 120);
  };

  const resetLayout = () => {
    setTabTarget("Proof Map");
    setVisualType("Code Map");
    setInteractionMode("Clickable");
    setDensity("Balanced");
    setTone("Technical");
    setTheme("Dark");
    setRouter("manhattan");
    setConnector("rounded");
    setActivePreset("Full");
    setActiveLayers(defaultLayers);
    setSelectedNode("portfolio");
    window.setTimeout(fitCanvas, 180);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard access can be blocked in local previews.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    async function renderJointMap() {
      const container = canvasRef.current;
      if (!container) return;

      const joint: JointNamespace = await import("@joint/core");
      if (disposed) return;

      container.innerHTML = "";
      const width = Math.max(container.clientWidth, 340);
      const height = compact ? 540 : roomy ? 720 : 640;
      const gridSize = compact ? 10 : 14;
      const activeRouter = routerConfig("manhattan", gridSize);
      const activeConnector = connectorConfig("rounded");
      const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
      const paper = new joint.dia.Paper({
        el: container,
        model: graph,
        width,
        height,
        gridSize,
        drawGrid: { name: "mesh", args: { color: light ? "#d9e0ea" : "rgba(255,255,255,0.075)", thickness: 1 } },
        background: { color: light ? "#f7f8fb" : "#0d1117" },
        cellViewNamespace: joint.shapes,
        async: false,
        sorting: joint.dia.Paper.sorting.APPROX,
        interactive: interactionMode === "Static" ? false : { linkMove: false, labelMove: false },
        defaultRouter: activeRouter,
        defaultConnector: activeConnector,
      });

      const elementMap = new Map<string, InstanceType<typeof joint.shapes.standard.Rectangle>>();
      const linkMap = new Map<string, InstanceType<typeof joint.shapes.standard.Link>>();

      nodes.forEach((node) => {
        const meta = layerMeta[node.layer];
        const rect = new joint.shapes.standard.Rectangle();
        rect.position(node.x, node.y);
        rect.resize(compact ? 172 : roomy ? 214 : 192, compact ? 62 : roomy ? 82 : 72);
        rect.attr({
          body: {
            rx: 14,
            ry: 14,
            fill: light ? "#ffffff" : "#161a28",
            stroke: meta.color,
            strokeWidth: 1.8,
            filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.28))",
          },
          label: {
            text: joint.util.breakText(node.label, { width: compact ? 132 : roomy ? 174 : 154, height: 42 }),
            fill: light ? "#111827" : "#f8fafc",
            fontSize: compact ? 12 : 13,
            fontWeight: 800,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
          },
        });
        rect.addTo(graph);
        elementMap.set(node.id, rect);
      });

      links.forEach((linkDef) => {
        const source = elementMap.get(linkDef.source);
        const target = elementMap.get(linkDef.target);
        if (!source || !target) return;
        const link = new joint.shapes.standard.Link();
        const stroke = {
          routes: "#60a5fa",
          reads: "#34d399",
          packages: "#a78bfa",
          verifies: "#ff6363",
          publishes: "#facc15",
        }[linkDef.type];
        link.source(source);
        link.target(target);
        link.router(activeRouter.name, "args" in activeRouter ? activeRouter.args : undefined);
        link.connector(activeConnector.name, "args" in activeConnector ? activeConnector.args : undefined);
        link.attr({
          line: {
            stroke,
            strokeWidth: 2,
            strokeOpacity: 0.82,
            targetMarker: { type: "path", d: "M 10 -5 0 0 10 5 z", fill: stroke },
          },
        });
        link.labels([
          {
            position: 0.5,
            attrs: {
              text: { text: linkDef.label, fill: light ? "#334155" : "#e5edff", fontSize: 11, fontWeight: 800 },
              rect: { fill: light ? "#ffffff" : "#101522", stroke: light ? "#d7deea" : "rgba(255,255,255,0.16)", rx: 7, ry: 7 },
            },
          },
        ]);
        link.addTo(graph);
        linkMap.set(linkDef.id, link);
      });

      paper.on("element:pointerclick", (view: { model: { id: string | number } }) => {
        const match = [...elementMap.entries()].find(([, cell]) => cell.id === view.model.id);
        if (match) setSelectedNode(match[0]);
      });
      paper.on("element:mouseenter", (view: { model: { id: string | number } }) => {
        const match = [...elementMap.entries()].find(([, cell]) => cell.id === view.model.id);
        if (match) setSelectedNode(match[0]);
      });

      graphRef.current = graph as unknown as { getElements: () => unknown[]; getLinks: () => unknown[] };
      paperRef.current = paper;
      elementMapRef.current = elementMap as unknown as Map<string, { attr: (path: string, value?: unknown) => void }>;
      linkMapRef.current = linkMap as unknown as Map<string, CanvasLinkCell>;
      window.setTimeout(fitCanvas, 80);

      resizeObserver = new ResizeObserver(() => {
        paper.setDimensions(Math.max(container.clientWidth, 340), height);
        fitCanvas();
      });
      resizeObserver.observe(container);
    }

    renderJointMap();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      paperRef.current?.remove?.();
      graphRef.current = null;
      paperRef.current = null;
      elementMapRef.current.clear();
      linkMapRef.current.clear();
    };
  }, [compact, fitCanvas, interactionMode, light, roomy]);

  useEffect(() => {
    const activeRouter = routerConfig(router, compact ? 10 : 14);
    const activeConnector = connectorConfig(connector);

    linkMapRef.current.forEach((link) => {
      link.router(activeRouter.name, "args" in activeRouter ? activeRouter.args : undefined);
      link.connector(activeConnector.name, "args" in activeConnector ? activeConnector.args : undefined);
    });

    window.setTimeout(fitCanvas, 80);
  }, [compact, connector, fitCanvas, router]);

  useEffect(() => {
    nodes.forEach((node) => {
      const element = elementMapRef.current.get(node.id);
      if (!element) return;
      const visible = activeLayers[node.layer];
      element.attr("root/display", visible ? "block" : "none");
      element.attr("body/fill", light ? "#ffffff" : layerMeta[node.layer].soft);
    });

    links.forEach((link) => {
      const cell = linkMapRef.current.get(link.id);
      if (!cell) return;
      const visible = visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target);
      cell.attr("line/display", visible ? "block" : "none");
    });

    applyHighlights(selectedNode);
    window.setTimeout(fitCanvas, 80);
  }, [activeLayers, applyHighlights, fitCanvas, light, selectedNode, visibleNodeIds]);

  return (
    <main className={cx("min-h-dvh overflow-hidden px-4 py-5 sm:px-6 lg:px-8", light ? "bg-[#eef1f6] text-slate-950" : "bg-[#080910] text-white")}>
      <div
        className={cx(
          "pointer-events-none fixed inset-0",
          mixed
            ? "bg-[radial-gradient(circle_at_18%_12%,rgba(255,99,99,0.25),transparent_31%),radial-gradient(circle_at_84%_16%,rgba(96,165,250,0.22),transparent_34%),linear-gradient(135deg,#080910,#151523_50%,#edf1f6_50%,#edf1f6)]"
            : light
              ? "bg-[radial-gradient(circle_at_18%_12%,rgba(96,165,250,0.18),transparent_34%),linear-gradient(135deg,#eef1f6,#ffffff)]"
              : "bg-[radial-gradient(circle_at_14%_10%,rgba(255,99,99,0.28),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(96,165,250,0.24),transparent_34%),linear-gradient(135deg,#080910,#151520_48%,#0b0f17)]",
        )}
      />

      <section className={cx("relative mx-auto w-full max-w-7xl overflow-hidden rounded-[26px] border shadow-[0_26px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl", light ? "border-slate-200 bg-white/86" : "border-white/14 bg-white/[0.075]")}>
        <div className={cx("flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-end lg:justify-between", light ? "border-slate-200" : "border-white/10")}>
          <div>
            <p className={cx("m-0 text-xs font-bold uppercase tracking-[0.18em]", light ? "text-slate-500" : "text-white/40")}>AI workflow visual lab</p>
            <h1 className="m-0 mt-2 text-3xl font-bold leading-tight tracking-normal sm:text-4xl">Interactive Code Map planning playground</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRouter(nextValue<RouterValue>(["manhattan", "orthogonal", "normal"], router))} className={cx("min-h-10 rounded-xl border px-3 text-sm font-bold", light ? "border-slate-300 bg-white text-slate-900" : "border-white/14 bg-white/9 text-white")}>
              Router: {router}
            </button>
            <button type="button" onClick={() => setConnector(nextValue<ConnectorValue>(["rounded", "smooth", "normal"], connector))} className={cx("min-h-10 rounded-xl border px-3 text-sm font-bold", light ? "border-slate-300 bg-white text-slate-900" : "border-white/14 bg-white/9 text-white")}>
              Connector: {connector}
            </button>
            <button type="button" onClick={fitCanvas} className="min-h-10 rounded-xl bg-white px-4 text-sm font-bold text-black">Fit view</button>
            <button type="button" onClick={resetLayout} className={cx("min-h-10 rounded-xl border px-4 text-sm font-bold", light ? "border-slate-300 bg-white text-slate-900" : "border-white/14 bg-white/9 text-white")}>Reset</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className={cx("border-b p-4 lg:border-b-0 lg:border-r", light ? "border-slate-200" : "border-white/10")}>
            <div className="grid gap-5">
              <OptionGroup label="Page tab target" values={tabTargets} value={tabTarget} onChange={setTabTarget} />
              <OptionGroup label="Visual type" values={visualTypes} value={visualType} onChange={setVisualType} />
              <OptionGroup label="Interaction mode" values={interactionModes} value={interactionMode} onChange={setInteractionMode} />
              <OptionGroup label="Density" values={densities} value={density} onChange={setDensity} />
              <OptionGroup label="Tone" values={tones} value={tone} onChange={setTone} />
              <OptionGroup label="Theme" values={themes} value={theme} onChange={setTheme} />

              <div>
                <p className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.14em] text-white/38">Presets</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(presets) as Array<keyof typeof presets>).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPreset(preset)}
                      className={cx("min-h-9 rounded-lg border px-2 text-xs font-bold", activePreset === preset ? "border-white/25 bg-white text-black" : "border-white/12 bg-white/8 text-white/64 hover:bg-white/14")}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.14em] text-white/38">Layers</p>
                <div className="grid gap-1.5">
                  {(Object.keys(layerMeta) as Layer[]).map((layer) => (
                    <button
                      key={layer}
                      type="button"
                      onClick={() => {
                        setActivePreset("Full");
                        setActiveLayers((current) => ({ ...current, [layer]: !current[layer] }));
                      }}
                      className={cx("flex min-h-9 items-center justify-between rounded-lg border px-2.5 text-xs font-bold", activeLayers[layer] ? "border-white/18 bg-white/10 text-white" : "border-white/8 bg-transparent text-white/36")}
                    >
                      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: layerMeta[layer].color }} />{layerMeta[layer].label}</span>
                      <span>{activeLayers[layer] ? "On" : "Off"}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 p-3 sm:p-4">
            <div className={cx("relative overflow-hidden rounded-2xl border", light ? "border-slate-200 bg-white" : "border-white/10 bg-black/24")}>
              <a
                href="https://jointjs.com?utm_source=singleton-systems&utm_medium=visual-lab&utm_campaign=react-code-map"
                target="_blank"
                rel="noopener noreferrer"
                className={cx("absolute right-3 top-3 z-10 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] backdrop-blur", light ? "border-slate-200 bg-white/85 text-slate-500" : "border-white/12 bg-black/45 text-white/48")}
              >
                Powered by JointJS
              </a>
              <div ref={canvasRef} className="min-h-[540px] w-full overflow-hidden sm:min-h-[620px]" aria-label="JointJS workflow code map canvas" />
            </div>
          </div>

          <aside className={cx("border-t p-4 lg:border-l lg:border-t-0", light ? "border-slate-200" : "border-white/10")}>
            <div className="grid gap-4">
              <div className={cx("rounded-2xl border p-4", light ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.06]")}>
                <p className={cx("m-0 text-xs font-bold uppercase tracking-[0.14em]", light ? "text-slate-500" : "text-white/36")}>Selected path</p>
                <h2 className="m-0 mt-3 text-xl font-bold leading-tight">{selected.label}</h2>
                <p className={cx("mt-2 text-sm font-semibold leading-6", light ? "text-slate-600" : "text-white/62")}>{selected.detail}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {links
                    .filter((link) => link.source === selected.id || link.target === selected.id)
                    .map((link) => (
                      <span key={link.id} className={cx("rounded-lg border px-2 py-1 text-xs font-bold", light ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/12 bg-white/8 text-white/55")}>
                        {link.label}
                      </span>
                    ))}
                </div>
              </div>

              <div className={cx("rounded-2xl border p-4", light ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.06]")}>
                <div className="flex items-center justify-between gap-3">
                  <p className={cx("m-0 text-xs font-bold uppercase tracking-[0.14em]", light ? "text-slate-500" : "text-white/36")}>Prompt output</p>
                  <button type="button" onClick={copyPrompt} className="min-h-8 rounded-lg bg-white px-3 text-xs font-bold text-black">{copied ? "Copied" : "Copy"}</button>
                </div>
                <pre className={cx("mt-3 whitespace-pre-wrap rounded-xl border p-3 text-xs font-semibold leading-5", light ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/10 bg-black/24 text-white/66")}>{prompt}</pre>
              </div>

              <div className={cx("rounded-2xl border p-4 text-sm font-semibold leading-6", light ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/[0.06] text-white/58")}>
                Drag nodes, toggle layers, switch routers, fit the canvas, hover/select nodes, then copy the implementation prompt.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
