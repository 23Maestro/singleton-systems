import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import satori from "satori";

const width = 1200;
const height = 760;

const fonts = [
  {
    name: "Arial",
    data: await readFile("/System/Library/Fonts/Supplemental/Arial.ttf"),
    weight: 400,
    style: "normal",
  },
  {
    name: "Arial",
    data: await readFile("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    weight: 700,
    style: "normal",
  },
  {
    name: "Courier New",
    data: await readFile("/System/Library/Fonts/Supplemental/Courier New.ttf"),
    weight: 400,
    style: "normal",
  },
  {
    name: "Courier New",
    data: await readFile("/System/Library/Fonts/Supplemental/Courier New Bold.ttf"),
    weight: 700,
    style: "normal",
  },
];

const artifacts = [
  {
    file: "public/portfolio/source-map/supabase-contract-satori.svg",
    title: "supabase-contract",
    label: "Source Rules",
    language: "json",
    theme: "light",
    source: `[
  {
    "workflow": "post_call_action",
    "source_action": "Raycast Scout Prep",
    "legacy_write": "Task and stage save first",
    "supabase_write": "lifecycleSalesStage"
  },
  {
    "workflow": "meeting_set",
    "source_action": "Raycast Scout Prep",
    "legacy_write": "Meeting and sales stage save first",
    "supabase_write": "recordMeetingSet plus cache"
  },
  {
    "workflow": "confirmation_texts",
    "source_action": "Head Scout Schedules",
    "legacy_write": "Calendar prefix update",
    "supabase_write": "verified active appointments row"
  }
]`,
  },
  {
    file: "public/portfolio/source-map/live-parity-test-satori.svg",
    title: "live-parity.test",
    label: "Audit Checks",
    language: "mjs",
    theme: "dark",
    source: `test('owner-context rows project into call_log shape', () => {
  const row = projectEventRowToCallLog({
    id: 'activity-row-1',
    raw_event_type: 'call_activity',
    tracker_outcome: 'spoke_follow_up',
    reporting_at: '2026-06-01T14:00:00Z',
    athlete_key: 'athlete:1',
    athlete_name: 'Ryan Example',
    raw_task_status: 'spoke_to_follow_up',
    source_owner: 'Primary Operator',
    compatibility_owner_proof: 'task_assigned_owner',
    active_operator_key: 'operator_primary',
    counts_as_dial: true,
    counts_as_contact: true,
    counts_as_meeting_set: false,
  });

  expect(row.owner_proof).toBe('task_assigned_owner');
  expect(row.counts_as_contact).toBe(true);
});`,
  },
];

const palette = {
  light: {
    canvas: "#f8fafc",
    card: "#ffffff",
    chrome: "#f3f4f6",
    border: "#e5e7eb",
    title: "#2563eb",
    text: "#374151",
    dim: "#64748b",
    key: "#2563eb",
    string: "#15803d",
    literal: "#7c3aed",
    punctuation: "#374151",
  },
  dark: {
    canvas: "#07111f",
    card: "#0b1220",
    chrome: "#111827",
    border: "#223047",
    title: "#60a5fa",
    text: "#dbeafe",
    dim: "#94a3b8",
    key: "#93c5fd",
    string: "#86efac",
    literal: "#fbbf24",
    punctuation: "#dbeafe",
  },
};

function tokenColor(token, colors) {
  if (/^".*"$/.test(token) && token.endsWith(":")) return colors.key;
  if (/^".*"$/.test(token)) return colors.string;
  if (/^(true|false|null)$/.test(token)) return colors.literal;
  if (/^(test|const|expect|toBe)$/.test(token)) return colors.key;
  if (/^'.*'$/.test(token)) return colors.string;
  if (/^\d/.test(token)) return colors.literal;
  return colors.punctuation;
}

function tokenize(line) {
  return line.match(/"[^"]*"(?=:)|"[^"]*"|'[^']*'|[A-Za-z_][A-Za-z0-9_]*|\d[\d:T.Z-]*|\\s+|./g) ?? [line];
}

function codeLine(line, index, colors) {
  return h(
    "div",
    {
      key: `${index}-${line}`,
      style: {
        display: "flex",
        flexDirection: "row",
        minHeight: 22,
        lineHeight: "22px",
        whiteSpace: "pre",
      },
    },
    h(
      "span",
      {
        style: {
          width: 42,
          flexShrink: 0,
          color: colors.dim,
          opacity: 0.48,
          textAlign: "right",
          paddingRight: 18,
        },
      },
      String(index + 1),
    ),
    h(
      "span",
      { style: { display: "flex", flexDirection: "row", color: colors.text } },
      ...tokenize(line).map((token, tokenIndex) =>
        h(
          "span",
          {
            key: `${index}-${tokenIndex}`,
            style: { color: token.trim() ? tokenColor(token, colors) : colors.text },
          },
          token,
        ),
      ),
    ),
  );
}

function artifactCard(artifact) {
  const colors = palette[artifact.theme];
  const lines = artifact.source.split("\n");

  return h(
    "div",
    {
      style: {
        display: "flex",
        width,
        height,
        padding: 54,
        background: colors.canvas,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 38,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.16)",
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: 82,
            padding: "0 34px",
            background: colors.chrome,
            borderBottom: `1px solid ${colors.border}`,
          },
        },
        h("div", { style: { display: "flex", gap: 10, marginRight: 22 } },
          h("div", { style: { width: 13, height: 13, borderRadius: 999, background: "#ff5f57" } }),
          h("div", { style: { width: 13, height: 13, borderRadius: 999, background: "#ffbd2e" } }),
          h("div", { style: { width: 13, height: 13, borderRadius: 999, background: "#28c840" } }),
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            },
          },
          h("div", { style: { color: colors.title, fontSize: 25, fontWeight: 700 } }, artifact.title),
          h("div", { style: { color: colors.dim, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.4 } }, artifact.label),
        ),
        h(
          "div",
          {
            style: {
              marginLeft: "auto",
              color: colors.dim,
              fontSize: 15,
              fontWeight: 700,
              textTransform: "uppercase",
            },
          },
          artifact.language,
        ),
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "30px 38px",
            fontFamily: "Courier New",
            fontSize: 18,
            overflow: "hidden",
          },
        },
        ...lines.map((line, index) => codeLine(line, index, colors)),
      ),
    ),
  );
}

for (const artifact of artifacts) {
  const svg = await satori(artifactCard(artifact), { width, height, fonts });
  await writeFile(artifact.file, svg);
  console.log(`generated ${artifact.file}`);
}
