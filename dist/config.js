"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSandbox = exports.isMockMode = exports.config = void 0;
const zod_1 = require("zod");
const ConfigSchema = zod_1.z.object({
    API_KEY: zod_1.z.string().optional(),
    SECRET_KEY: zod_1.z.string().optional(),
    ENVIRONMENT: zod_1.z.string().default("sandbox"),
    API_BASE_URL: zod_1.z.string().default("https://pay.tunzaa.co.tz"),
    ALLOWED_HOSTS: zod_1.z.array(zod_1.z.string()).default([]),
    EXPOSE_TOKEN: zod_1.z.boolean().default(false),
});
const splitList = (value) => (value || "").split(",").map(entry => entry.trim()).filter(Boolean);
const rawConfig = {
    API_KEY: process.env.MALIPO_API_KEY || process.env.TUNZAA_API_KEY,
    SECRET_KEY: process.env.MALIPO_SECRET_KEY || process.env.TUNZAA_SECRET_KEY,
    ENVIRONMENT: process.env.MALIPO_ENVIRONMENT || process.env.TUNZAA_ENVIRONMENT || "sandbox",
    API_BASE_URL: process.env.MALIPO_API_BASE_URL || process.env.TUNZAA_API_BASE_URL || "https://pay.tunzaa.co.tz",
    ALLOWED_HOSTS: splitList(process.env.MALIPO_ALLOWED_HOSTS || process.env.TUNZAA_ALLOWED_HOSTS),
    EXPOSE_TOKEN: (process.env.MALIPO_EXPOSE_TOKEN || process.env.TUNZAA_EXPOSE_TOKEN || "").toLowerCase() === "true",
};
exports.config = ConfigSchema.parse(rawConfig);
exports.isMockMode = !exports.config.API_KEY || !exports.config.SECRET_KEY;
exports.isSandbox = exports.config.ENVIRONMENT.toLowerCase() === "sandbox";
if (exports.isMockMode) {
    console.warn("Notice: MALIPO_API_KEY and/or MALIPO_SECRET_KEY not found. Server running in MOCK MODE. Tools will return static example data for the Malipo API.");
}
