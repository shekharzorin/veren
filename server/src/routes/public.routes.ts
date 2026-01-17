import { Router } from 'express';
import { getPublicTransaction, initiatePublicPayment } from '../controllers/public.controller';

const router = Router();

router.get('/transactions/:id', getPublicTransaction);
router.post('/transactions/:id/pay', initiatePublicPayment);

export default router;
