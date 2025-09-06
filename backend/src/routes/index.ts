import { Router } from 'express';
import auth from './auth';
import products from './products';
import purchases from './purchases';
import invoices from './invoices';
import stock from './stock';

const router = Router();
router.use('/auth', auth);
router.use('/products', products);
router.use('/purchases', purchases);
router.use('/invoices', invoices);
router.use('/stock', stock);

export default router;
