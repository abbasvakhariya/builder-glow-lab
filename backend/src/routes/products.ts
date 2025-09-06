import { Router } from 'express';
import * as ctrl from '../controllers/productsController';
import { authMiddleware } from '../middlewares/auth';
import { permit } from '../middlewares/rbac';
import multer from 'multer';

const upload = multer({ dest: process.env.UPLOAD_DIR || 'uploads' });
const router = Router();

router.get('/', authMiddleware, ctrl.listProducts);
router.get('/:id', authMiddleware, ctrl.getProduct);
router.post('/', authMiddleware, permit('manager','staff'), ctrl.createProduct);
router.patch('/:id', authMiddleware, permit('manager','staff'), ctrl.updateProduct);
router.delete('/:id', authMiddleware, permit('manager'), ctrl.deleteProduct);
router.post('/:id/image', authMiddleware, permit('manager'), upload.single('image'), ctrl.uploadImage);

export default router;
