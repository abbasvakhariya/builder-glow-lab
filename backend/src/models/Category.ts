import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  parent?: mongoose.Types.ObjectId | null;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
