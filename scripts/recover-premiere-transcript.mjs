#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const [projectPath, outputDirectory, outputStem = "recovered-transcript"] = process.argv.slice(2);

if (!projectPath || !outputDirectory) {
  console.error("Usage: recover-premiere-transcript.mjs <project.prproj> <output-dir> [output-stem]");
  process.exit(1);
}

const PREMIERE_TICKS_PER_SECOND = 254_016_000_000;
const xml = execFileSync("gzip", ["-dc", projectPath], {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});

const documents = [...xml.matchAll(
  /<ExternallyProvidedTranscriptDocument ObjectID="(\d+)"[\s\S]*?<TranscriptData[^>]*>([A-Za-z0-9+/=\s]+)<\/TranscriptData>/g,
)];

if (!documents.length) {
  throw new Error(`No embedded Premiere transcript found in ${basename(projectPath)}`);
}

const [, objectId, encoded] = documents.sort((a, b) => b[2].length - a[2].length)[0];
const data = Buffer.from(encoded.replace(/\s/g, ""), "base64");

function fieldOffset(tablePosition, fieldIndex) {
  const vtablePosition = tablePosition - data.readInt32LE(tablePosition);
  const vtableLength = data.readUInt16LE(vtablePosition);
  const entryPosition = vtablePosition + 4 + fieldIndex * 2;
  return entryPosition + 2 <= vtablePosition + vtableLength
    ? data.readUInt16LE(entryPosition)
    : 0;
}

function fieldPosition(tablePosition, fieldIndex) {
  const offset = fieldOffset(tablePosition, fieldIndex);
  return offset ? tablePosition + offset : null;
}

function offsetTarget(position) {
  return position + data.readUInt32LE(position);
}

function fieldTarget(tablePosition, fieldIndex) {
  const position = fieldPosition(tablePosition, fieldIndex);
  return position === null ? null : offsetTarget(position);
}

function readString(position) {
  const length = data.readUInt32LE(position);
  return data.subarray(position + 4, position + 4 + length).toString("utf8");
}

function readOffsetVector(position) {
  const length = data.readUInt32LE(position);
  const values = [];
  for (let index = 0; index < length; index += 1) {
    const elementPosition = position + 4 + index * 4;
    values.push(offsetTarget(elementPosition));
  }
  return values;
}

function secondsFromTicks(ticks) {
  return Number(ticks) / PREMIERE_TICKS_PER_SECOND;
}

function parseWord(wordTable) {
  const textTarget = fieldTarget(wordTable, 2);
  const startPosition = fieldPosition(wordTable, 0);
  const durationPosition = fieldPosition(wordTable, 1);

  if (textTarget === null || startPosition === null || durationPosition === null) return null;

  const start = secondsFromTicks(data.readBigUInt64LE(startPosition));
  const duration = secondsFromTicks(data.readBigUInt64LE(durationPosition));

  return {
    text: readString(textTarget),
    start,
    end: start + duration,
  };
}

const rootTable = data.readUInt32LE(0);
const documentTable = fieldTarget(rootTable, 0);
const segmentVector = documentTable === null ? null : fieldTarget(documentTable, 0);

if (segmentVector === null) {
  throw new Error("Embedded transcript did not contain a segment vector");
}

const segments = readOffsetVector(segmentVector).map((segmentTable) => {
  const wordVector = fieldTarget(segmentTable, 3);
  if (wordVector === null) return [];
  return readOffsetVector(wordVector).map(parseWord).filter(Boolean);
}).filter((segment) => segment.length);

const words = segments.flat().sort((a, b) => a.start - b.start);

function displayTime(seconds, milliseconds = true) {
  const totalMilliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const millis = totalMilliseconds % 1000;
  const base = [hours, minutes, wholeSeconds].map((value) => String(value).padStart(2, "0")).join(":");
  return milliseconds ? `${base}.${String(millis).padStart(3, "0")}` : base;
}

function srtTime(seconds) {
  return displayTime(seconds).replace(".", ",");
}

function joinWords(items) {
  return items.map((item) => item.text).join(" ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([“‘(])\s+/g, "$1")
    .replace(/\s+([”’)])/g, "$1")
    .replace(/\s+'/g, "'")
    .trim();
}

function sentenceRows(allWords) {
  const rows = [];
  let current = [];

  const flush = () => {
    if (!current.length) return;
    rows.push({
      start: current[0].start,
      end: current.at(-1).end,
      text: joinWords(current),
    });
    current = [];
  };

  for (const word of allWords) {
    const previous = current.at(-1);
    if (previous && word.start - previous.end > 1.1) flush();
    current.push(word);

    const duration = word.end - current[0].start;
    if (/[.!?][”']?$/.test(word.text) || duration >= 16) flush();
  }
  flush();
  return rows;
}

function captionRows(allWords) {
  const rows = [];
  let current = [];

  const flush = () => {
    if (!current.length) return;
    rows.push({
      start: current[0].start,
      end: Math.max(current.at(-1).end, current[0].start + 0.7),
      text: joinWords(current),
    });
    current = [];
  };

  for (const word of allWords) {
    const previous = current.at(-1);
    if (previous && word.start - previous.end > 0.8) flush();
    current.push(word);
    const duration = word.end - current[0].start;
    if (current.length >= 10 || duration >= 4.2 || /[.!?][”']?$/.test(word.text)) flush();
  }
  flush();
  return rows;
}

const sentences = sentenceRows(words);
const captions = captionRows(words);
const duration = words.at(-1)?.end ?? 0;

const textOutput = [
  "MICHELLE STROY — FUTURE VOICES INTERVIEW",
  `Recovered from: ${basename(projectPath)}`,
  `Premiere transcript object: ${objectId}`,
  `Duration: ${displayTime(duration, false)}`,
  "",
  ...sentences.map((row) => `[${displayTime(row.start)} – ${displayTime(row.end)}]  ${row.text}`),
  "",
].join("\n");

const srtOutput = captions.map((row, index) => [
  index + 1,
  `${srtTime(row.start)} --> ${srtTime(row.end)}`,
  row.text,
].join("\n")).join("\n\n") + "\n";

const jsonOutput = JSON.stringify({
  sourceProject: projectPath,
  transcriptObjectId: objectId,
  duration,
  words,
  sentences,
}, null, 2) + "\n";

mkdirSync(outputDirectory, { recursive: true });
const textPath = join(outputDirectory, `${outputStem}.txt`);
const srtPath = join(outputDirectory, `${outputStem}.srt`);
const jsonPath = join(outputDirectory, `${outputStem}.json`);

writeFileSync(textPath, textOutput);
writeFileSync(srtPath, srtOutput);
writeFileSync(jsonPath, jsonOutput);

console.log(JSON.stringify({
  projectPath,
  transcriptObjectId: objectId,
  segmentCount: segments.length,
  wordCount: words.length,
  sentenceCount: sentences.length,
  captionCount: captions.length,
  duration,
  textPath,
  srtPath,
  jsonPath,
}, null, 2));
