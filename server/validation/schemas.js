import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email address"));
const name = z
  .string()
  .trim()
  .min(1, "Enter your name")
  .max(60, "Name must be at most 60 characters");
const newPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const registerSchema = z.object({ name, email, password: newPassword });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(128),
});

export const updateProfileSchema = z.object({ name });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(128),
  newPassword,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm").max(128),
});

// Links must stay inside the app (no "//host" or "javascript:" URLs)
const appLink = z
  .string()
  .max(2000)
  .regex(
    /^\/(visualizer|data-structures)(\/[a-z-]+)?(\?[\w\-.,~%=&+]*)?$/,
    "Invalid link",
  );

const summary = z
  .object({
    steps: z.number().int().min(0).max(1_000_000),
    comparisons: z.number().int().min(0).max(1_000_000),
    swaps: z.number().int().min(0).max(1_000_000),
    operations: z.number().int().min(0).max(1_000_000),
    result: z.string().max(500),
  })
  .partial();

// Inputs are small JSON objects (arrays of numbers, edge lists, operation logs)
const input = z
  .record(z.string(), z.unknown())
  .refine(
    (value) => JSON.stringify(value).length <= 10_000,
    "Input is too large",
  );

export const createHistorySchema = z.object({
  kind: z.enum(["algorithm", "data-structure"]),
  itemId: z.string().regex(/^[a-z-]{1,40}$/, "Invalid item"),
  title: z.string().trim().min(1).max(80),
  input: input.default({}),
  summary: summary.default({}),
  link: appLink,
});

export const updateHistorySchema = createHistorySchema
  .pick({ input: true, summary: true, link: true })
  .partial();
