import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export type Role = 'owner' | 'manager' | 'staff';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'manager', 'staff'], default: 'staff' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
