import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface IInvoice extends Document {
  customer?: { name: string; phone?: string };
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: boolean;
}

const InvoiceSchema = new Schema<IInvoice>({
  customer: { name: String, phone: String },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
    },
  ],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paid: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
