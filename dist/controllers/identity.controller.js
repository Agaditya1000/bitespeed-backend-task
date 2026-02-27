"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyContact = void 0;
const validation_1 = require("../utils/validation");
const identity_service_1 = require("../services/identity.service");
const identifyContact = async (req, res, next) => {
    try {
        const parsedParams = validation_1.identitySchema.safeParse(req.body);
        if (!parsedParams.success) {
            return res.status(400).json({ error: parsedParams.error.flatten() });
        }
        const { email, phoneNumber } = parsedParams.data;
        const contactResponse = await (0, identity_service_1.reconcileIdentity)(email || undefined, phoneNumber || undefined);
        res.status(200).json({ contact: contactResponse });
    }
    catch (error) {
        next(error);
    }
};
exports.identifyContact = identifyContact;
