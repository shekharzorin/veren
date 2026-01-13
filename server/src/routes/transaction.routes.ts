import { Router } from 'express';
import { createEOI, createBooking } from '../controllers/transaction.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/eoi', authenticateToken, createEOI);
router.post('/booking', authenticateToken, createBooking);

export default router;
