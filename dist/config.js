"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMockMode = exports.config = void 0;
const zod_1 = require("zod");
const ConfigSchema = zod_1.z.object({
    API_KEY: zod_1.z.string().optional(),
    SECRET_KEY: zod_1.z.string().optional(),
    ENVIRONMENT: zod_1.z.string().default("sandbox"),
    API_BASE_URL: zod_1.z.string().default("https://pay.tunzaa.co.tz"),
});
const rawConfig = {
    API_KEY: process.env.TUNZAA_API_KEY,
    SECRET_KEY: process.env.TUNZAA_SECRET_KEY,
    ENVIRONMENT: process.env.TUNZAA_ENVIRONMENT || "sandbox",
    API_BASE_URL: process.env.TUNZAA_API_BASE_URL || "https://pay.tunzaa.co.tz",
};
exports.config = ConfigSchema.parse(rawConfig);
exports.isMockMode = !exports.config.API_KEY || !exports.config.SECRET_KEY;
if (exports.isMockMode) {
    console.warn("Notice: TUNZAA_API_KEY and/or TUNZAA_SECRET_KEY not found. Server running in MOCK MODE. Tools will return static example data.");
}
