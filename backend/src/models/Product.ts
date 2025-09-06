import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  category?: mongoose.Types.ObjectId;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  supplier?: mongoose.Types.ObjectId;
  lowStockThreshold?: number;
  stockOnHand: number;
  trackBatches?: boolean;
  images?: string[];
}

const ProductSchema = new Schema<IProduct>({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, text: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  unit: { type: String, default: 'pcs' },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  lowStockThreshold: { type: Number, default: 0 },
  stockOnHand: { type: Number, default: 0 },
  trackBatches: { type: Boolean, default: false },
  images: [String],
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
