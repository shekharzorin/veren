import { Router } from 'express';
import { checkEligibility, getMyClients, createClient, updateClient } from '../controllers/client.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/check', authenticateToken, checkEligibility);
router.get('/my', authenticateToken, getMyClients);
router.post('/', authenticateToken, createClient);
router.put('/:id', authenticateToken, updateClient);

export default router;
