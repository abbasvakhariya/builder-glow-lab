import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import StockTransaction from '../models/StockTransaction';

export const lowStock = async (req: Request, res: Response) => {
  const products = await Product.find({ $expr: { $lt: ['$stockOnHand', '$lowStockThreshold'] } }).limit(100);
  res.json(products);
};

export const adjustStock = async (req: Request, res: Response) => {
  const { productId, qty, reason } = req.body;
  if (!productId || typeof qty !== 'number') return res.status(400).json({ message: 'Invalid' });
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const prod = await Product.findById(productId).session(session);
    if (!prod) throw { status: 404, message: 'Product not found' };
    prod.stockOnHand += qty;
    await prod.save({ session });
    await StockTransaction.create([{
      product: prod._id,
      qty: qty,
      type: 'ADJ',
      reason: reason || 'manual',
      unitCost: prod.costPrice,
      refModel: 'Adjustment',
    }], { session });
    await session.commitTransaction();
    session.endSession();
    res.json({ ok: true });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
