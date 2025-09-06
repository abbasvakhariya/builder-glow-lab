import { Router } from 'express';
import * as ctrl from '../controllers/invoicesController';
import { authMiddleware } from '../middlewares/auth';
import { permit } from '../middlewares/rbac';

const router = Router();
router.post('/', authMiddleware, permit('manager','staff'), ctrl.createInvoice);
router.get('/', authMiddleware, permit('manager','staff'), ctrl.listInvoices);
router.get('/:id', authMiddleware, permit('manager','staff'), ctrl.getInvoice);
router.get('/:id/pdf', authMiddleware, permit('manager','staff'), ctrl.invoicePdf);

export default router;
