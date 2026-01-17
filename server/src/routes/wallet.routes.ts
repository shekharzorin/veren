import { Router } from 'express';
import { getMyWallet, requestWithdrawal, settleCommission } from '../controllers/wallet.controller';
import { authenticateToken as authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticate, getMyWallet);
router.post('/withdraw', authenticate, requestWithdrawal);
router.post('/settle-commission', authenticate, settleCommission);

export default router;
