import mongoose, { Schema, Document } from 'mongoose';

export type TxType = 'IN' | 'OUT' | 'ADJ';

export interface IStockTransaction extends Document {
  product: mongoose.Types.ObjectId;
  qty: number; // signed for convenience (IN positive, OUT negative)
  type: TxType;
  reason: string;
  unitCost?: number;
  refModel?: string;
  refId?: mongoose.Types.ObjectId;
  batch?: { code?: string; expiry?: Date } | null;
}

const StockTransactionSchema = new Schema<IStockTransaction>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  qty: { type: Number, required: true },
  type: { type: String, enum: ['IN', 'OUT', 'ADJ'], required: true },
  reason: { type: String, required: true },
  unitCost: Number,
  refModel: String,
  refId: Schema.Types.ObjectId,
  batch: {
    code: String,
    expiry: Date,
  },
}, { timestamps: true });

export default mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema);
