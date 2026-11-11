import { z } from "zod";
import { studioAssetPath } from "./studio-assets.ts";

export const studioClient = z.enum(["Catena Media", "Intent Solutions", "Singleton Systems"]);
const id = z.uuid();
const task = z.object({ owner: z.enum(["asana", "linear"]), id: z.string().trim().min(1).max(160) }).strict();
const httpsUrl = z.url().max(2000).refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
});
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const assetUrl = z.union([studioAssetPath, httpsUrl]);
const reviewId = z.string().regex(/^[A-Za-z0-9_-]{1,160}$/);
const version = z.looseObject({
  id: reviewId, label: z.string().min(1),
  stage: z.enum(["Plan", "Artwork", "Motion", "Revisions"]),
  kind: z.enum(["plan", "image", "video"]), sha256: hash,
  url: assetUrl.optional(), poster: assetUrl.nullish(),
}).refine(item => item.kind === "plan" || Boolean(item.url));
const scene = z.looseObject({
  id: reviewId, title: z.string().min(1), duration: z.number().nonnegative(),
  thumbnail: assetUrl.nullish(), sourceUrl: httpsUrl.nullish(),
  versions: z.array(version).min(1),
}).refine(item => new Set(item.versions.map(entry => entry.id)).size === item.versions.length);
export const studioReviewPacket = z.looseObject({
  episodeId: reviewId, revision: hash, fps: z.number().int().min(1).max(120),
  initialScene: reviewId, scenes: z.array(scene).min(1),
}).refine(packet => new Set(packet.scenes.map(entry => entry.id)).size === packet.scenes.length
  && packet.scenes.some(entry => entry.id === packet.initialScene));

const coordinate = z.number().min(0).max(1);
const text = z.string().trim().min(1).max(6000);
const reviewNote = z.object({
  id, episodeId: reviewId, sceneId: reviewId, versionId: reviewId, mediaSha256: hash,
  body: text, time: z.number().nonnegative().nullable(),
  snapshot: z.string().max(1_500_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/).nullable(),
  width: z.number().int().positive().max(16384).optional(),
  height: z.number().int().positive().max(16384).optional(),
  marks: z.array(z.object({ x: coordinate, y: coordinate, width: coordinate, height: coordinate }).strict()).max(200),
  replies: z.array(text).max(100), resolved: z.boolean(),
}).strict();
export const studioFeedback = z.object({
  statuses: z.record(reviewId, z.enum(["In Progress", "Needs Review", "Changes Requested", "Approved"])),
  notes: z.array(reviewNote).max(200),
}).strict().refine(feedback => new Set(feedback.notes.map(note => note.id)).size === feedback.notes.length);
export const studioReviewRevision = hash;
export const studioProjectId = id;
export const studioChatSend = z.object({
  requestId: id, projectId: id, revision: hash, version: z.number().int().positive(),
  status: z.enum(["queued", "claimed", "delivered"]), turnId: id.optional(),
  origin: z.object({ hostId: z.string().min(1), threadId: id }),
  storyboardUrl: httpsUrl, feedback: studioFeedback, frameLinks: z.boolean().optional(),
}).refine(send => send.status !== "delivered" || Boolean(send.turnId));
export const STUDIO_REQUEST_BYTES = 3_500_000;

export const studioCommand = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start-lineups"),
    projectId: id,
    episodeSlug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,119}$/),
    asanaTask: z.string().regex(/^\d{10,25}$/),
    title: z.string().trim().min(1).max(120),
    handoff: z.object({
      storyboardUrl: httpsUrl,
      packet: z.string().min(2).max(500000).optional(),
      origin: z.object({ hostId: z.string().min(1).max(160), threadId: id }).strict(),
    }).strict().optional(),
  }).strict(),
  z.object({ action: z.literal("create"), projectId: id, client: studioClient, title: z.string().trim().min(1).max(120), task: task.nullable() }).strict(),
  z.object({ action: z.literal("packet"), projectId: id, packet: z.string().min(2).max(500000) }).strict(),
  z.object({
    action: z.literal("save-review"), projectId: id, revision: hash,
    expectedVersion: z.number().int().nonnegative(), feedback: studioFeedback,
  }).strict(),
  z.object({
    action: z.literal("queue-chat-send"), projectId: id, revision: hash, version: z.number().int().positive(),
  }).strict(),
  z.object({ action: z.literal("claim-chat-send"), projectId: id, requestId: id }).strict(),
  z.object({
    action: z.literal("confirm-chat-send"), projectId: id, requestId: id, threadId: id, turnId: id,
  }).strict(),
  z.object({ action: z.literal("feedback"), projectId: id, feedback: z.string().min(2).max(500000) }).strict(),
  z.object({ action: z.literal("close"), projectId: id }).strict(),
  z.object({ action: z.literal("close-linked"), projectId: id, task }).strict(),
  z.object({ action: z.literal("reopen"), projectId: id }).strict(),
  z.object({ action: z.literal("delete"), projectId: id }).strict(),
]);
