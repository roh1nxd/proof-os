import { z } from "zod";

const walletSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address");

const slugSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

const optionalLink = z.string().max(200).optional();

export const createProfileSchema = z
  .object({
    slug: slugSchema,
    displayName: z.string().min(1).max(64),
    bio: z.string().max(500).optional(),
    skills: z.array(z.string().max(32)).max(20).optional(),
    avatarUrl: z.string().max(500).optional(),
    github: optionalLink,
    twitter: optionalLink,
    instagram: optionalLink,
    linkedin: z.string().url().max(200).optional().or(z.literal("")),
    website: z.string().url().max(200).optional().or(z.literal("")),
    ens: z.string().max(64).optional(),
  })
  .refine(
    (data) =>
      Boolean(
        data.github?.trim() ||
          data.twitter?.trim() ||
          data.instagram?.trim() ||
          data.linkedin?.trim() ||
          data.website?.trim(),
      ),
    {
      message: "Add at least one social link (GitHub, X, Instagram, LinkedIn, or website)",
      path: ["github"],
    },
  );

export const createContributionSchema = z.object({
  project: z.string().min(1).max(120),
  role: z.string().min(1).max(64),
  github: z.string().url().max(200).optional(),
  description: z.string().max(1000).optional(),
  proofUrl: z.string().url().max(200).optional(),
});

export const createEndorsementSchema = z.object({
  toWallet: walletSchema,
  message: z.string().min(10).max(500),
  skills: z.array(z.string().max(32)).max(10).optional(),
});

export const verifyRequestSchema = z.object({
  wallet: walletSchema,
  minScore: z.number().min(0).max(100).optional(),
});

export const updateProfileSchema = z
  .object({
    displayName: z.string().min(1).max(64),
    bio: z.string().max(500).optional(),
    skills: z.array(z.string().max(32)).max(20).optional(),
    avatarUrl: z.string().max(500).optional(),
    github: optionalLink,
    twitter: optionalLink,
    instagram: optionalLink,
    linkedin: z.string().url().max(200).optional().or(z.literal("")),
    website: z.string().url().max(200).optional().or(z.literal("")),
    ens: z.string().max(64).optional(),
  })
  .refine(
    (data) =>
      Boolean(
        data.github?.trim() ||
          data.twitter?.trim() ||
          data.instagram?.trim() ||
          data.linkedin?.trim() ||
          data.website?.trim(),
      ),
    {
      message: "Add at least one social link (GitHub, X, Instagram, LinkedIn, or website)",
      path: ["github"],
    },
  );

export { walletSchema, slugSchema };
