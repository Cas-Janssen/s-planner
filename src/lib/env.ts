import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  HOSTNAME: z.string().optional(),
  PORT: z.string().optional(),

  NEXT_PUBLIC_APP_NAME: z.string().optional(),
});

function validateEnv() {
  try {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error(
        "❌ Invalid environment variables:",
        parsed.error.flatten().fieldErrors,
      );
      throw new Error("Invalid environment variables");
    }

    const hasGoogle =
      parsed.data.GOOGLE_CLIENT_ID && parsed.data.GOOGLE_CLIENT_SECRET;
    const hasGithub =
      parsed.data.GITHUB_CLIENT_ID && parsed.data.GITHUB_CLIENT_SECRET;

    if (!hasGoogle && !hasGithub) {
      console.warn("⚠️  No social authentication providers configured");
    }

    return parsed.data;
  } catch (error) {
    console.error("Failed to validate environment variables:", error);
    process.exit(1);
  }
}

export const env = validateEnv();
