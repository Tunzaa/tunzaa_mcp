import { z } from "zod";

const ConfigSchema = z.object({
  API_KEY: z.string().optional(),
  SECRET_KEY: z.string().optional(),
  ENVIRONMENT: z.string().default("sandbox"),
  API_BASE_URL: z.string().default("https://pay.tunzaa.co.tz"),
  ALLOWED_HOSTS: z.array(z.string()).default([]),
  EXPOSE_TOKEN: z.boolean().default(false),
  COMMERCE_BASE_URL: z.string().default("https://api.demo.tunzaa.co.tz"),
  TENANT_ID: z.string().default(""),
  CURRENCY: z.string().default("TZS"),
});

const splitList = (value?: string) =>
  (value || "").split(",").map(entry => entry.trim()).filter(Boolean);

const rawConfig = {
  API_KEY: process.env.MALIPO_API_KEY || process.env.TUNZAA_API_KEY,
  SECRET_KEY: process.env.MALIPO_SECRET_KEY || process.env.TUNZAA_SECRET_KEY,
  ENVIRONMENT: process.env.MALIPO_ENVIRONMENT || process.env.TUNZAA_ENVIRONMENT || "sandbox",
  API_BASE_URL: process.env.MALIPO_API_BASE_URL || process.env.TUNZAA_API_BASE_URL || "https://pay.tunzaa.co.tz",
  ALLOWED_HOSTS: splitList(process.env.MALIPO_ALLOWED_HOSTS || process.env.TUNZAA_ALLOWED_HOSTS),
  EXPOSE_TOKEN: (process.env.MALIPO_EXPOSE_TOKEN || process.env.TUNZAA_EXPOSE_TOKEN || "").toLowerCase() === "true",
  COMMERCE_BASE_URL: process.env.MALIPO_COMMERCE_BASE_URL || process.env.TUNZAA_COMMERCE_BASE_URL || "https://api.demo.tunzaa.co.tz",
  TENANT_ID: process.env.MALIPO_TENANT_ID || process.env.TUNZAA_TENANT_ID || "",
  CURRENCY: process.env.MALIPO_CURRENCY || process.env.TUNZAA_CURRENCY || "TZS",
};

export const config = ConfigSchema.parse(rawConfig);

export const isMockMode = !config.API_KEY || !config.SECRET_KEY;

export const isSandbox = config.ENVIRONMENT.toLowerCase() === "sandbox";

// Commerce (soko) tools run in mock mode until a tenant id is configured.
export const isCommerceMockMode = !config.TENANT_ID;

if (isCommerceMockMode) {
    console.warn("Notice: MALIPO_TENANT_ID not set. Commerce (soko) tools running in MOCK MODE and will return static example data.");
}

if (isMockMode) {
    console.warn("Notice: MALIPO_API_KEY and/or MALIPO_SECRET_KEY not found. Server running in MOCK MODE. Tools will return static example data for the Malipo API.");
}
