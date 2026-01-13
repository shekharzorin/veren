import { Router } from 'express';
import { checkEligibility, getMyClients } from '../controllers/client.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/check', authenticateToken, checkEligibility);
router.get('/my', authenticateToken, getMyClients);

export default router;
