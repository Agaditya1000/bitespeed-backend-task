import { Request, Response, NextFunction } from 'express';
import { identitySchema } from '../utils/validation';
import { reconcileIdentity } from '../services/identity.service';

export const identifyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedParams = identitySchema.safeParse(req.body);

        if (!parsedParams.success) {
            return res.status(400).json({ error: parsedParams.error.flatten() });
        }

        const { email, phoneNumber } = parsedParams.data;

        const contactResponse = await reconcileIdentity(
            email || undefined,
            phoneNumber ? String(phoneNumber) : undefined
        );

        res.status(200).json({ contact: contactResponse });
    } catch (error) {
        next(error);
    }
};
