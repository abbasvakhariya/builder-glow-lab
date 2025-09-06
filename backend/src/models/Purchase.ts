import mongoose, { Schema, Document } from 'mongoose';

export type PurchaseStatus = 'PO' | 'RECEIVED' | 'CANCELLED';

export interface IPurchaseItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  batch?: { code?: string; expiry?: Date } | null;
}

export interface IPurchase extends Document {
  supplier: mongoose.Types.ObjectId;
  status: PurchaseStatus;
  items: IPurchaseItem[];
  totalCost: number;
  receivedAt?: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  status: { type: String, enum: ['PO', 'RECEIVED', 'CANCELLED'], default: 'PO' },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      unitCost: { type: Number, required: true },
      batch: { code: String, expiry: Date },
    },
  ],
  totalCost: { type: Number, default: 0 },
  receivedAt: Date,
}, { timestamps: true });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
