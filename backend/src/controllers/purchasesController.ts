import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Purchase from '../models/Purchase';
import Product from '../models/Product';
import StockTransaction from '../models/StockTransaction';

export const createPurchase = async (req: Request, res: Response) => {
  const body = req.body;
  const total = (body.items || []).reduce((s:any,i:any)=>s + i.quantity * i.unitCost,0);
  const purchase = await Purchase.create({ ...body, totalCost: total });
  res.status(201).json(purchase);
};

export const listPurchases = async (req: Request, res: Response) => {
  const purchases = await Purchase.find().sort({ createdAt: -1 }).limit(50);
  res.json(purchases);
};

export const getPurchase = async (req: Request, res: Response) => {
  const p = await Purchase.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
};

export const receivePurchase = async (req: Request, res: Response) => {
  const id = req.params.id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const purchase = await Purchase.findById(id).session(session);
    if (!purchase) throw { status: 404, message: 'Not found' };
    if (purchase.status === 'RECEIVED') throw { status: 400, message: 'Already received' };

    // update each product stock and create stock transactions
    for (const item of purchase.items) {
      const prod = await Product.findById(item.product).session(session);
      if (!prod) throw { status: 404, message: 'Product not found' };
      prod.stockOnHand += item.quantity;
      prod.costPrice = item.unitCost; // record latest cost
      await prod.save({ session });

      await StockTransaction.create([
        {
          product: prod._id,
          qty: item.quantity,
          type: 'IN',
          reason: 'receive',
          unitCost: item.unitCost,
          refModel: 'Purchase',
          refId: purchase._id,
          batch: item.batch || null,
        },
      ], { session });
    }

    purchase.status = 'RECEIVED';
    purchase.receivedAt = new Date();
    await purchase.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ ok: true });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
