import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

const SupplierSchema = new Schema<ISupplier>({
  name: { type: String, required: true },
  phone: String,
  email: String,
  address: String,
}, { timestamps: true });

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);
