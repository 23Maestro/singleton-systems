import { z } from "zod";

export const REEL_PURPOSES = ["Recruiting", "Social media", "Season keepsake", "Not sure"] as const;
export const FOOTAGE_OPTIONS = [
  "Clips already picked",
  "Full games with plays marked",
  "Full games that need reviewing",
  "Not sure",
] as const;

const phone = z
  .string()
  .regex(/^\+?[\d\s().-]+$/)
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15;
  });

export const recruitingInquirySchema = z.object({
  requestId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  contact: z
    .string()
    .trim()
    .max(320)
    .pipe(z.union([z.string().email(), phone])),
  sport: z.string().trim().min(1).max(80),
  purpose: z.enum(REEL_PURPOSES),
  footage: z.enum(FOOTAGE_OPTIONS),
  deadline: z.union([z.literal(""), z.string().date()]),
  company: z.string().max(0),
});

export type RecruitingInquiry = z.infer<typeof recruitingInquirySchema>;
