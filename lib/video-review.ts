import { z } from "zod";

export const reviewId = z.uuid();
const mediaUrl = z.url().refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
});
export const reviewRenderSchema = z.object({
  reviewId, renderId: reviewId,
  title: z.string().trim().min(1).max(160),
  revision: z.string().trim().min(1).max(80),
  media: z.object({
    url: mediaUrl, sha256: z.string().regex(/^[a-f0-9]{64}$/),
    width: z.number().int().positive().max(16384), height: z.number().int().positive().max(16384),
    duration: z.number().finite().positive(),
  }).strict(),
  origin: z.object({ hostId: z.string().min(1).max(160), threadId: reviewId }).strict().nullable(),
}).strict();
export const storedReviewRenderSchema = reviewRenderSchema.extend({
  media: reviewRenderSchema.shape.media.omit({ url: true, sha256: true }).extend({
    storageId: z.string().min(1).max(128),
  }).strict(),
});
export const reviewRenderInputSchema = z.union([reviewRenderSchema, storedReviewRenderSchema]);
export const frameNoteSchema = z.object({
  noteId: reviewId, renderId: reviewId,
  body: z.string().trim().min(1).max(6000),
  presentedTime: z.number().finite().nonnegative(),
}).strict();
export type ReviewRender = z.infer<typeof reviewRenderSchema>;
export type FrameNote = z.infer<typeof frameNoteSchema> & {
  reviewId: string; mediaSha256: string; snapshotSha256: string;
  width: number; height: number; region: null; snapshotUrl: string;
};
export type VideoReview = {
  renders: Omit<ReviewRender, "origin">[];
  notes: FrameNote[];
};
