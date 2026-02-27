"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identitySchema = void 0;
const zod_1 = require("zod");
exports.identitySchema = zod_1.z.object({
    email: zod_1.z.string().email().optional().nullable(),
    phoneNumber: zod_1.z.string().optional().nullable(),
}).refine(data => data.email || data.phoneNumber, {
    message: "At least one of email or phoneNumber must be provided",
    path: ["email", "phoneNumber"]
});
