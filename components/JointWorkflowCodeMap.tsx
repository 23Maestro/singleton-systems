"use client";

import { useMemo, useState } from "react";
import {
  type PortfolioSlice,
  type PortfolioTabTarget,
  type PortfolioVisualType,
  type SliceElement,
  defaultSliceByTab,
  getSliceElements,
  sliceOptionsByTab,
  sliceTitles,
  SliceRawPreview,
  tabTargets,
  visualTypes,
} from "./PortfolioSlices";

type InteractionMode = "Static" | "Clickable" | "Step-through";
type Density = "Compact" | "Balanced" | "Spacious";
type Tone = "Portfolio" | "Executive" | "Technical";
type Theme = "Light" | "Dark" | "Mixed";

const interactionModes: InteractionMode[] = ["Static", "Clickable", "Step-through"];
const densities: Density[] = ["Compact", "Balanced", "Spacious"];
const tones: Tone[] = ["Portfolio", "Executive", "Technical"];
const themes: Theme[] = ["Light", "Dark", "Mixed"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function densityClasses(density: Density) {
  if (density === "Compact") return { pad: "p-3", gap: "gap-2", text: "text-xs", min: "min-h-[74px]" };
  if (density === "Spacious") return { pad: "p-6", gap: "gap-4", text: "text-sm", min: "min-h-[124px]" };
  return { pad: "p-4", gap: "gap-3", text: "text-[13px]", min: "min-h-[96px]" };
}

function themeClasses(theme: Theme) {
  if (theme === "Light") {
    return {
      page: "bg-[#eef1f6] text-slate-950",
      shell: "border-slate-200 bg-white",
      panel: "border-slate-200 bg-[#f8fafc]",
      soft: "bg-white",
      muted: "text-slate-500",
      line: "border-slate-200",
      selected: "border-[#2383e2] bg-[#eef4ff] text-[#111827]",
      accent: "text-[#2383e2]",
    };
  }

  if (theme === "Mixed") {
    return {
      page: "bg-[linear-gradient(135deg,#111827,#263247_48%,#eef1f6_48%,#ffffff)] text-white",
      shell: "border-white/16 bg-white/10 backdrop-blur-xl",
      panel: "border-white/12 bg-black/25",
      soft: "bg-white/8",
      muted: "text-white/58",
      line: "border-white/12",
      selected: "border-white/55 bg-white text-black",
      accent: "text-sky-200",
    };
  }

  return {
    page: "bg-[#080910] text-white",
    shell: "border-white/14 bg-white/[0.075] backdrop-blur-xl",
    panel: "border-white/10 bg-black/24",
    soft: "bg-white/8",
    muted: "text-white/58",
    line: "border-white/10",
    selected: "border-white/45 bg-white text-black",
    accent: "text-sky-200",
  };
}

function toneRadius(tone: Tone) {
  if (tone === "Technical") return "rounded-md";
  if (tone === "Executive") return "rounded-xl";
  return "rounded-2xl";
}

function OptionGroup<T extends string>({
  label,
  values,
  value,
  onChange,
  classes,
}: {
  label: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
  classes: ReturnType<typeof themeClasses>;
}) {
  return (
    <section className="min-w-0">
      <p className={cx("mb-2 mt-0 text-[10px] font-bold uppercase tracking-[0.14em]", classes.muted)}>{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cx(
              "min-h-8 rounded-lg border px-2.5 text-xs font-bold transition",
              value === option ? classes.selected : cx(classes.line, "bg-transparent hover:bg-white/10"),
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

function SliceControl({
  tab,
  value,
  onChange,
  classes,
}: {
  tab: PortfolioTabTarget;
  value: PortfolioSlice;
  onChange: (slice: PortfolioSlice) => void;
  classes: ReturnType<typeof themeClasses>;
}) {
  const allowed = sliceOptionsByTab[tab];
  const locked = allowed.length === 1;

  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className={cx("m-0 text-[10px] font-bold uppercase tracking-[0.14em]", classes.muted)}>Slice</p>
        {locked ? <span className={cx("text-[10px] font-bold uppercase tracking-[0.12em]", classes.muted)}>Locked</span> : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(["Top", "Bottom"] as const).map((option) => {
          const disabled = !allowed.includes(option);
          return (
            <button
              key={option}
              type="button"
              disabled={disabled || locked}
              aria-pressed={value === option}
              onClick={() => onChange(option)}
              className={cx(
                "min-h-8 rounded-lg border px-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-45",
                value === option ? classes.selected : cx(classes.line, "bg-transparent hover:bg-white/10"),
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CardTreatment({
  elements,
  selected,
  onSelect,
  classes,
  density,
  tone,
}: {
  elements: SliceElement[];
  selected: SliceElement;
  onSelect: (id: string) => void;
  classes: ReturnType<typeof themeClasses>;
  density: Density;
  tone: Tone;
}) {
  const d = densityClasses(density);
  return (
    <div className={cx("grid md:grid-cols-2 xl:grid-cols-3", d.gap)} data-preview-kind="Cards">
      {elements.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={item.id === selected.id}
          onClick={() => onSelect(item.id)}
          className={cx(
            "border text-left transition",
            toneRadius(tone),
            d.pad,
            d.min,
            item.id === selected.id ? classes.selected : cx(classes.panel, "hover:bg-white/10"),
          )}
        >
          <p className="m-0 text-[10px] font-black uppercase tracking-[0.13em] opacity-70">{item.eyebrow}</p>
          <h3 className="m-0 mt-1 text-base font-black leading-tight">{item.label}</h3>
          <p className={cx("m-0 mt-2 leading-5 opacity-75", d.text)}>{item.body}</p>
        </button>
      ))}
    </div>
  );
}

function RealSliceTreatment({
  tab,
  slice,
  selected,
  onSelect,
}: {
  tab: PortfolioTabTarget;
  slice: PortfolioSlice;
  selected: SliceElement;
  onSelect: (id: string) => void;
}) {
  return (
    <div data-preview-kind="Cards">
      <SliceRawPreview tab={tab} slice={slice} selectedId={selected.id} onSelect={onSelect} />
    </div>
  );
}

function TableTreatment({
  elements,
  selected,
  onSelect,
  classes,
  density,
}: {
  elements: SliceElement[];
  selected: SliceElement;
  onSelect: (id: string) => void;
  classes: ReturnType<typeof themeClasses>;
  density: Density;
}) {
  const d = densityClasses(density);
  return (
    <div className={cx("overflow-hidden border", classes.line, toneRadius("Technical"))} data-preview-kind="Data Table">
      <div className={cx("grid grid-cols-[1fr_120px_1.2fr] gap-3 border-b px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] max-md:hidden", classes.line, classes.soft)}>
        <span>Element</span>
        <span>Kind</span>
        <span>Source route</span>
      </div>
      {elements.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={item.id === selected.id}
          onClick={() => onSelect(item.id)}
          className={cx(
            "grid w-full gap-3 border-b px-3 text-left last:border-b-0 md:grid-cols-[1fr_120px_1.2fr]",
            d.text,
            density === "Compact" ? "py-2" : "py-3",
            classes.line,
            item.id === selected.id ? classes.selected : "hover:bg-white/10",
          )}
        >
          <strong>{item.label}</strong>
          <span className="opacity-65">{item.kind}</span>
          <span className="truncate opacity-75">{item.route}</span>
        </button>
      ))}
    </div>
  );
}

function FlowchartTreatment({
  elements,
  selected,
  onSelect,
  classes,
  density,
}: {
  elements: SliceElement[];
  selected: SliceElement;
  onSelect: (id: string) => void;
  classes: ReturnType<typeof themeClasses>;
  density: Density;
}) {
  const d = densityClasses(density);
  return (
    <div className="grid gap-2" data-preview-kind="Flowchart">
      {elements.map((item, index) => (
        <div key={item.id} className="grid justify-items-center gap-2">
          <button
            type="button"
            aria-pressed={item.id === selected.id}
            onClick={() => onSelect(item.id)}
            className={cx(
              "w-full max-w-[620px] border text-left transition",
              toneRadius(index === 0 || index === elements.length - 1 ? "Executive" : "Technical"),
              d.pad,
              item.id === selected.id ? classes.selected : cx(classes.panel, "hover:bg-white/10"),
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.12em] opacity-65">Step {index + 1} / {item.eyebrow}</span>
            <strong className="mt-1 block text-base">{item.label}</strong>
            <span className={cx("mt-1 block leading-5 opacity-75", d.text)}>{item.after}</span>
          </button>
          {index < elements.length - 1 ? <div className={cx("h-6 w-px border-l", classes.line)} aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

function ReviewTreatment({
  elements,
  selected,
  onSelect,
  classes,
  density,
  tone,
}: {
  elements: SliceElement[];
  selected: SliceElement;
  onSelect: (id: string) => void;
  classes: ReturnType<typeof themeClasses>;
  density: Density;
  tone: Tone;
}) {
  const d = densityClasses(density);
  return (
    <div className={cx("grid gap-3 border lg:grid-cols-[260px_minmax(0,1fr)]", toneRadius(tone), classes.panel, d.pad)} data-preview-kind="Review Panel">
      <div className="grid content-start gap-1.5">
        {elements.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === selected.id}
            onClick={() => onSelect(item.id)}
            className={cx("rounded-lg border px-3 py-2 text-left text-xs font-bold", item.id === selected.id ? classes.selected : cx(classes.line, "hover:bg-white/10"))}
          >
            {item.label}
          </button>
        ))}
      </div>
      <section className={cx("border", toneRadius("Technical"), classes.soft, d.pad)}>
        <p className={cx("m-0 text-[10px] font-black uppercase tracking-[0.14em]", classes.muted)}>Selected slice element</p>
        <h3 className="m-0 mt-2 text-2xl font-black leading-tight">{selected.label}</h3>
        <p className={cx("mt-2 max-w-[720px] leading-6", classes.muted)}>{selected.body}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Before", selected.before],
            ["After", selected.after],
            ["Route", selected.route],
          ].map(([label, body]) => (
            <div key={label} className={cx("border", toneRadius("Technical"), classes.panel, d.pad)}>
              <span className={cx("text-[10px] font-black uppercase tracking-[0.12em]", classes.muted)}>{label}</span>
              <p className={cx("m-0 mt-2 font-bold leading-5", d.text)}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DiffTreatment({
  selected,
  classes,
  density,
}: {
  selected: SliceElement;
  classes: ReturnType<typeof themeClasses>;
  density: Density;
}) {
  const d = densityClasses(density);
  return (
    <div className={cx("overflow-hidden border font-mono", toneRadius("Technical"), classes.panel)} data-preview-kind="Diff View">
      <div className={cx("border-b px-3 py-2 text-[11px] font-bold", classes.line)}>
        diff --git a/{slug(selected.route)} b/{slug(selected.route)}
      </div>
      <div className={cx("px-3 py-2 text-[11px]", classes.muted)}>@@ {selected.eyebrow} / {selected.label} @@</div>
      <div className={cx("px-3 py-2 text-red-300 bg-red-500/10", d.text)}>- {selected.before}</div>
      <div className={cx("px-3 py-2 text-green-300 bg-green-500/10", d.text)}>+ {selected.after}</div>
      <div className={cx("px-3 py-2 text-sky-200 bg-sky-500/10", d.text)}>+ Source component: {selected.route}</div>
    </div>
  );
}

function CodeMapTreatment({
  elements,
  selected,
  onSelect,
  classes,
}: {
  elements: SliceElement[];
  selected: SliceElement;
  onSelect: (id: string) => void;
  classes: ReturnType<typeof themeClasses>;
}) {
  return (
    <div className={cx("relative min-h-[520px] overflow-hidden border", toneRadius("Executive"), classes.panel)} data-preview-kind="Code Map">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 520" role="img" aria-label="Selected slice code map">
        <defs>
          <marker id="portfolio-slice-arrowhead" markerHeight="8" markerWidth="8" orient="auto" refX="6" refY="3">
            <path d="M0,0 L0,6 L7,3 z" fill="currentColor" />
          </marker>
        </defs>
        {elements.slice(0, -1).map((item, index) => {
          const startX = index % 2 === 0 ? 210 : 690;
          const startY = 94 + index * 76;
          const endX = index % 2 === 0 ? 690 : 210;
          const endY = 158 + index * 76;
          return (
            <path
              key={item.id}
              d={`M ${startX} ${startY} C 450 ${startY}, 450 ${endY}, ${endX} ${endY}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.28"
              strokeWidth="2"
              markerEnd="url(#portfolio-slice-arrowhead)"
            />
          );
        })}
      </svg>
      <div className="relative grid gap-5 p-5">
        {elements.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === selected.id}
            onClick={() => onSelect(item.id)}
            className={cx(
              "w-[min(280px,100%)] border px-4 py-3 text-left transition",
              toneRadius("Technical"),
              index % 2 === 0 ? "justify-self-start" : "justify-self-end",
              item.id === selected.id ? classes.selected : cx(classes.soft, classes.line),
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.12em] opacity-65">{item.kind}</span>
            <strong className="mt-1 block text-sm">{item.label}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewSurface({
  visualType,
  tab,
  slice,
  elements,
  selected,
  setSelectedId,
  classes,
  density,
  tone,
}: {
  visualType: PortfolioVisualType;
  tab: PortfolioTabTarget;
  slice: PortfolioSlice;
  elements: SliceElement[];
  selected: SliceElement;
  setSelectedId: (id: string) => void;
  classes: ReturnType<typeof themeClasses>;
  density: Density;
  tone: Tone;
}) {
  if (visualType === "Cards") return <RealSliceTreatment tab={tab} slice={slice} selected={selected} onSelect={setSelectedId} />;
  if (visualType === "Data Table") return <TableTreatment elements={elements} selected={selected} onSelect={setSelectedId} classes={classes} density={density} />;
  if (visualType === "Flowchart") return <FlowchartTreatment elements={elements} selected={selected} onSelect={setSelectedId} classes={classes} density={density} />;
  if (visualType === "Review Panel") return <ReviewTreatment elements={elements} selected={selected} onSelect={setSelectedId} classes={classes} density={density} tone={tone} />;
  if (visualType === "Diff View") return <DiffTreatment selected={selected} classes={classes} density={density} />;
  return <CodeMapTreatment elements={elements} selected={selected} onSelect={setSelectedId} classes={classes} />;
}

function firstElementId(tab: PortfolioTabTarget, slice: PortfolioSlice) {
  return getSliceElements(tab, slice)[0]?.id ?? "";
}

type SelectionKey = `${PortfolioTabTarget}:${PortfolioSlice}`;

function selectionKey(tab: PortfolioTabTarget, slice: PortfolioSlice): SelectionKey {
  return `${tab}:${slice}`;
}

export default function JointWorkflowCodeMap() {
  const [tabTarget, setTabTargetState] = useState<PortfolioTabTarget>("System");
  const [slice, setSliceState] = useState<PortfolioSlice>("Top");
  const [visualType, setVisualType] = useState<PortfolioVisualType>("Cards");
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("Clickable");
  const [density, setDensity] = useState<Density>("Balanced");
  const [tone, setTone] = useState<Tone>("Portfolio");
  const [theme, setTheme] = useState<Theme>("Dark");
  const [scale, setScale] = useState(100);
  const [selectedBySlice, setSelectedBySlice] = useState<Record<string, string>>({
    [selectionKey("System", "Top")]: firstElementId("System", "Top"),
    [selectionKey("Evidence", "Top")]: firstElementId("Evidence", "Top"),
    [selectionKey("Evidence", "Bottom")]: firstElementId("Evidence", "Bottom"),
    [selectionKey("AI Specialist", "Top")]: firstElementId("AI Specialist", "Top"),
    [selectionKey("AI Specialist", "Bottom")]: firstElementId("AI Specialist", "Bottom"),
    [selectionKey("Resume", "Bottom")]: firstElementId("Resume", "Bottom"),
    [selectionKey("Source Map", "Top")]: firstElementId("Source Map", "Top"),
    [selectionKey("Source Map", "Bottom")]: firstElementId("Source Map", "Bottom"),
  });
  const [copied, setCopied] = useState(false);

  const classes = themeClasses(theme);
  const allowedSlices = sliceOptionsByTab[tabTarget];
  const activeSlice = allowedSlices.includes(slice) ? slice : defaultSliceByTab[tabTarget];
  const elements = useMemo(() => getSliceElements(tabTarget, activeSlice), [tabTarget, activeSlice]);
  const selectedId = selectedBySlice[selectionKey(tabTarget, activeSlice)] ?? elements[0]?.id ?? "";
  const selected = elements.find((item) => item.id === selectedId) ?? elements[0];
  const sliceMeta = sliceTitles[tabTarget][activeSlice];
  const previewScale = scale / 100;

  function setTabTarget(nextTab: PortfolioTabTarget) {
    const nextSlice = defaultSliceByTab[nextTab];
    setTabTargetState(nextTab);
    setSliceState(nextSlice);
    setSelectedBySlice((current) => {
      const key = selectionKey(nextTab, nextSlice);
      if (current[key]) return current;
      return { ...current, [key]: firstElementId(nextTab, nextSlice) };
    });
  }

  function setSlice(nextSlice: PortfolioSlice) {
    if (!sliceOptionsByTab[tabTarget].includes(nextSlice)) return;
    setSliceState(nextSlice);
    setSelectedBySlice((current) => {
      const key = selectionKey(tabTarget, nextSlice);
      if (current[key]) return current;
      return { ...current, [key]: firstElementId(tabTarget, nextSlice) };
    });
  }

  function setSelectedId(id: string) {
    setSelectedBySlice((current) => ({ ...current, [selectionKey(tabTarget, activeSlice)]: id }));
  }

  function resetLab() {
    setTabTargetState("System");
    setSliceState("Top");
    setVisualType("Cards");
    setInteractionMode("Clickable");
    setDensity("Balanced");
    setTone("Portfolio");
    setTheme("Dark");
    setScale(100);
    setSelectedBySlice((current) => ({ ...current, [selectionKey("System", "Top")]: firstElementId("System", "Top") }));
  }

  const prompt = useMemo(() => {
    if (!selected) return "";
    return [
      `Update ${tabTarget} / ${activeSlice} / ${selected.label} into ${visualType} treatment inside /ai-workflow-portfolio/.`,
      `Target route: ${sliceMeta.route}.`,
      `Focused element: ${selected.label} (${selected.kind}).`,
      `Interaction: ${interactionMode}. Density: ${density}. Tone: ${tone}. Theme: ${theme}. Scale: ${scale}%.`,
      `Change this slice from: ${selected.before}`,
      `Change this slice to: ${selected.after}`,
      "Keep the selected portfolio slice stable, render only one preview treatment, and verify the previous treatment unmounts before review.",
    ].join("\n");
  }, [activeSlice, density, interactionMode, scale, selected, sliceMeta.route, tabTarget, theme, tone, visualType]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard access can be blocked in preview contexts.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main className={cx("min-h-dvh overflow-x-hidden px-3 py-4", classes.page)}>
      <section className={cx("mx-auto grid min-h-[calc(100dvh-32px)] w-full max-w-[1500px] overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.35)] lg:grid-cols-[25%_75%]", toneRadius("Executive"), classes.shell)}>
        <aside className={cx("max-h-[calc(100dvh-32px)] overflow-y-auto border-b p-4 lg:border-b-0 lg:border-r", classes.line)}>
          <h1 className="m-0 text-2xl font-black leading-tight">Portfolio prompt playground</h1>

          <div className="mt-5 grid gap-5">
            <OptionGroup label="Page tab target" values={tabTargets} value={tabTarget} onChange={setTabTarget} classes={classes} />
            <SliceControl tab={tabTarget} value={activeSlice} onChange={setSlice} classes={classes} />
            <OptionGroup label="Visual type" values={visualTypes} value={visualType} onChange={setVisualType} classes={classes} />
            <OptionGroup label="Interaction mode" values={interactionModes} value={interactionMode} onChange={setInteractionMode} classes={classes} />
            <OptionGroup label="Density" values={densities} value={density} onChange={setDensity} classes={classes} />
            <OptionGroup label="Tone" values={tones} value={tone} onChange={setTone} classes={classes} />
            <OptionGroup label="Theme" values={themes} value={theme} onChange={setTheme} classes={classes} />

            <section>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className={cx("m-0 text-[10px] font-bold uppercase tracking-[0.14em]", classes.muted)}>Preview scale</p>
                <span className="text-xs font-black">{scale}%</span>
              </div>
              <input
                aria-label="Preview scale"
                type="range"
                min="80"
                max="120"
                step="5"
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
                className="w-full"
              />
            </section>

            <section>
              <p className={cx("mb-2 mt-0 text-[10px] font-bold uppercase tracking-[0.14em]", classes.muted)}>Element focus</p>
              <div className="grid gap-1.5">
                {elements.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === selected.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cx(
                      "min-h-9 rounded-lg border px-2.5 text-left text-xs font-bold transition",
                      item.id === selected.id ? classes.selected : cx(classes.line, "bg-transparent hover:bg-white/10"),
                    )}
                  >
                    <span className="block">{item.label}</span>
                    <span className={cx("block text-[10px] font-semibold", item.id === selected.id ? "opacity-70" : classes.muted)}>{item.eyebrow}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={resetLab} className={cx("min-h-9 rounded-lg border text-xs font-black", classes.line, "hover:bg-white/10")}>Reset</button>
              <button type="button" onClick={copyPrompt} className="min-h-9 rounded-lg bg-white text-xs font-black text-black">{copied ? "Copied" : "Copy prompt"}</button>
            </div>
          </div>
        </aside>

        <section className="grid min-w-0 grid-rows-[auto_minmax(0,1fr)_auto]">
          <header className={cx("border-b p-4", classes.line)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={cx("m-0 text-[10px] font-black uppercase tracking-[0.16em]", classes.muted)}>{tabTarget} / {activeSlice} / {visualType}</p>
                <h2 className="m-0 mt-1 text-3xl font-black leading-tight">{sliceMeta.title}</h2>
                <p className={cx("m-0 mt-1 max-w-[780px] text-sm font-semibold leading-6", classes.muted)}>{sliceMeta.lead}</p>
              </div>
              <div className={cx("rounded-lg border px-3 py-2 text-xs font-bold", classes.line, classes.soft)}>
                {interactionMode} / {density} / {tone}
              </div>
            </div>
          </header>

          <div className="min-h-0 overflow-auto p-4">
            <div
              className="mx-auto w-full max-w-[1040px] origin-top transition-transform"
              style={{ transform: `scale(${previewScale})`, transformOrigin: "top center" }}
              aria-label="Live portfolio slice preview"
            >
              {selected ? (
                <PreviewSurface
                  visualType={visualType}
                  tab={tabTarget}
                  slice={activeSlice}
                  elements={elements}
                  selected={selected}
                  setSelectedId={setSelectedId}
                  classes={classes}
                  density={density}
                  tone={tone}
                />
              ) : null}
            </div>
          </div>

          <footer className={cx("grid gap-3 border-t p-4 lg:grid-cols-[minmax(0,1fr)_390px]", classes.line)}>
            <section className={cx("border p-3", toneRadius("Technical"), classes.panel)}>
              <p className={cx("m-0 text-[10px] font-black uppercase tracking-[0.14em]", classes.muted)}>Selected readback</p>
              <h3 className="m-0 mt-2 text-lg font-black">{selected?.label}</h3>
              <p className={cx("m-0 mt-1 text-sm font-semibold leading-5", classes.muted)}>{selected?.body}</p>
            </section>
            <pre className={cx("m-0 max-h-[180px] overflow-auto whitespace-pre-wrap border p-3 text-[11px] font-semibold leading-5", toneRadius("Technical"), classes.panel)}>{prompt}</pre>
          </footer>
        </section>
      </section>
    </main>
  );
}
