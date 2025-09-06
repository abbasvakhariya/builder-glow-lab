import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import Product from '../models/Product';
import StockTransaction from '../models/StockTransaction';

export const createInvoice = async (req: Request, res: Response) => {
  const body = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Validate stock
    for (const item of body.items) {
      const prod = await Product.findById(item.product).session(session);
      if (!prod) throw { status: 404, message: 'Product not found' };
      if (prod.stockOnHand < item.quantity) throw { status: 400, message: `Insufficient stock for ${prod.name}` };
    }

    const subtotal = body.items.reduce((s:any,i:any)=>s + i.quantity * i.unitPrice,0);
    const total = Math.max(0, subtotal + (body.tax||0) - (body.discount||0));
    const invoice = await Invoice.create([ { ...body, subtotal, total } ], { session });

    // Decrement stock and create tx entries
    for (const item of body.items) {
      const prod = await Product.findById(item.product).session(session);
      prod.stockOnHand -= item.quantity;
      await prod.save({ session });

      await StockTransaction.create([{
        product: prod._id,
        qty: -item.quantity,
        type: 'OUT',
        reason: 'sale',
        unitCost: prod.costPrice,
        refModel: 'Invoice',
        refId: invoice[0]._id,
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(invoice[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const listInvoices = async (req: Request, res: Response) => {
  const invoices = await Invoice.find().sort({ createdAt: -1 }).limit(50);
  res.json(invoices);
};

export const getInvoice = async (req: Request, res: Response) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ message: 'Not found' });
  res.json(inv);
};

export const invoicePdf = async (req: Request, res: Response) => {
  // simplified PDF generation using pdfkit
  const id = req.params.id;
  const invoice = await Invoice.findById(id).populate('items.product');
  if (!invoice) return res.status(404).json({ message: 'Not found' });
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
  doc.text('StockPilot Invoice');
  doc.text(`Invoice ID: ${invoice._id}`);
  doc.text(`Total: ${invoice.total}`);
  doc.end();
  doc.pipe(res);
};
