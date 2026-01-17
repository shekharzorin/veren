import { Router } from 'express';
import { getAllWallets, getGlobalTransactions } from '../controllers/admin.controller';
import { authenticateToken as authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/wallets', authenticate, getAllWallets);
router.get('/transactions', authenticate, getGlobalTransactions);

export default router;
