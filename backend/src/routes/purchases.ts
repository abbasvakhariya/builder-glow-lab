import { Router } from 'express';
import * as ctrl from '../controllers/purchasesController';
import { authMiddleware } from '../middlewares/auth';
import { permit } from '../middlewares/rbac';

const router = Router();
router.post('/', authMiddleware, permit('manager','staff'), ctrl.createPurchase);
router.get('/', authMiddleware, permit('manager','staff'), ctrl.listPurchases);
router.get('/:id', authMiddleware, permit('manager','staff'), ctrl.getPurchase);
router.post('/:id/receive', authMiddleware, permit('manager'), ctrl.receivePurchase);

export default router;
