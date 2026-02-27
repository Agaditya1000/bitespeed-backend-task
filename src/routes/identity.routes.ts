import { Router } from 'express';
import { identifyContact } from '../controllers/identity.controller';

const router = Router();

router.post('/', identifyContact);

export default router;
