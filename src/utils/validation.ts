import { z } from 'zod';

export const identitySchema = z.object({
    email: z.string().email().optional().nullable(),
    phoneNumber: z.union([z.string(), z.number()]).transform(val => val ? String(val) : val).optional().nullable(),
}).refine(data => data.email || data.phoneNumber, {
    message: "At least one of email or phoneNumber must be provided",
    path: ["email", "phoneNumber"]
});
