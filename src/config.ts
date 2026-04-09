import { z } from "zod";

const ConfigSchema = z.object({
  API_KEY: z.string().optional(),
  SECRET_KEY: z.string().optional(),
  ENVIRONMENT: z.string().default("sandbox"),
  API_BASE_URL: z.string().default("https://pay.tunzaa.co.tz"),
});

const rawConfig = {
  API_KEY: process.env.TUNZAA_API_KEY,
  SECRET_KEY: process.env.TUNZAA_SECRET_KEY,
  ENVIRONMENT: process.env.TUNZAA_ENVIRONMENT || "sandbox",
  API_BASE_URL: process.env.TUNZAA_API_BASE_URL || "https://pay.tunzaa.co.tz",
};

export const config = ConfigSchema.parse(rawConfig);

export const isMockMode = !config.API_KEY || !config.SECRET_KEY;

if (isMockMode) {
    console.warn("Notice: TUNZAA_API_KEY and/or TUNZAA_SECRET_KEY not found. Server running in MOCK MODE. Tools will return static example data.");
}
