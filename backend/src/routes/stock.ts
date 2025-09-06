import { Router } from 'express';
import * as ctrl from '../controllers/stockController';
import { authMiddleware } from '../middlewares/auth';
import { permit } from '../middlewares/rbac';

const router = Router();
router.get('/low', authMiddleware, permit('manager','staff'), ctrl.lowStock);
router.post('/adjust', authMiddleware, permit('manager'), ctrl.adjustStock);

export default router;
