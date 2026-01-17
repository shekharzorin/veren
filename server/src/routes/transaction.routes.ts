import { Router } from 'express';
import { createEOI, createBooking, getTransactionDetails, getMyTransactions } from '../controllers/transaction.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/eoi', authenticateToken, createEOI);
router.post('/booking', authenticateToken, createBooking);
router.get('/my', authenticateToken, getMyTransactions);
router.get('/details/:id', authenticateToken, getTransactionDetails); // Changed :id to details/:id to avoid conflict with /my if :id captures 'my'

export default router;
