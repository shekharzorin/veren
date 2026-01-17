import { Router } from 'express';
import { initiatePayment, handleWebhook, confirmManualPayment } from '../controllers/payment.controller';
import { authenticateToken as authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/initiate', authenticate, initiatePayment);
router.post('/webhook', handleWebhook); // Public, but should verify signature
router.post('/confirm-manual', authenticate, confirmManualPayment);

export default router;
