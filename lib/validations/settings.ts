import { z } from "zod";

export const portfolioLinkSchema = z.object({
  url: z.string().min(1),
  label: z.string().min(1),
  useCase: z.string().optional(),
});

export const settingsSchema = z.object({
  profileName: z.string().min(1, "Name is required"),
  profileEmail: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  emailSignature: z.string().optional(),
  portfolioLinks: z.array(portfolioLinkSchema),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
