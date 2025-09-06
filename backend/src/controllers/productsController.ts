import { Request, Response } from 'express';
import Product from '../models/Product';

export const listProducts = async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search = '' } = req.query as any;
  const q: any = {};
  if (search) q.$text = { $search: search };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([Product.find(q).limit(Number(limit)).skip(skip), Product.countDocuments(q)]);
  res.json({ items, total, page: Number(page) });
};

export const getProduct = async (req: Request, res: Response) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
};

export const createProduct = async (req: Request, res: Response) => {
  const body = req.body;
  const p = await Product.create(body);
  res.status(201).json(p);
};

export const updateProduct = async (req: Request, res: Response) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
};

export const deleteProduct = async (req: Request, res: Response) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};

export const uploadImage = async (req: Request, res: Response) => {
  // multer populates req.file
  const file = (req as any).file;
  if (!file) return res.status(400).json({ message: 'No file' });
  const p = await Product.findByIdAndUpdate(req.params.id, { $push: { images: `/uploads/${file.filename}` } }, { new: true });
  res.json(p);
};
