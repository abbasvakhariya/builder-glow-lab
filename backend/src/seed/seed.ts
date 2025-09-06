import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import User from '../models/User';
import Category from '../models/Category';
import Supplier from '../models/Supplier';
import Product from '../models/Product';
import Purchase from '../models/Purchase';
import Invoice from '../models/Invoice';

async function run() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Supplier.deleteMany({}), Product.deleteMany({}), Purchase.deleteMany({}), Invoice.deleteMany({})]);

  const owner = await User.create({ name: 'Owner', email: 'owner@demo.io', password: 'Owner@123', role: 'owner' });
  const manager = await User.create({ name: 'Manager', email: 'manager@demo.io', password: 'Manager@123', role: 'manager' });
  const staff = await User.create({ name: 'Staff', email: 'staff@demo.io', password: 'Staff@123', role: 'staff' });

  const cats = await Category.create([
    { name: 'Beverages' }, { name: 'Snacks' }, { name: 'Household' }, { name: 'Dairy' }, { name: 'Frozen' }
  ]);

  const sups = await Supplier.create([
    { name: 'Blue Ocean Suppliers', phone: '+1 202 555 0101' },
    { name: 'Local Wholesale', phone: '+1 202 555 0111' },
    { name: 'Fresh Farms', phone: '+1 202 555 0122' },
  ]);

  const products = [] as any[];
  for (let i = 1; i <= 15; i++) {
    const p = await Product.create({
      sku: `SKU-${1000+i}`,
      name: `Demo Product ${i}`,
      category: cats[i%cats.length]._id,
      unit: 'pcs',
      costPrice: Number((Math.random()*5+0.5).toFixed(2)),
      sellingPrice: Number((Math.random()*10+1).toFixed(2)),
      supplier: sups[i% sups.length]._id,
      lowStockThreshold: Math.floor(Math.random()*20)+5,
      stockOnHand: Math.floor(Math.random()*120),
    });
    products.push(p);
  }

  // Create purchases: one received
  const po1 = await Purchase.create({ supplier: sups[0]._id, items: [ { product: products[0]._id, quantity: 50, unitCost: 1.2 } ], totalCost: 60 });
  const po2 = await Purchase.create({ supplier: sups[1]._id, items: [ { product: products[1]._id, quantity: 30, unitCost: 0.8 } ], totalCost: 24, status: 'RECEIVED', receivedAt: new Date() });

  // Create invoices: today and yesterday
  const inv1 = await Invoice.create({ customer: { name: 'Walk-in' }, items: [ { product: products[0]._id, quantity: 2, unitPrice: products[0].sellingPrice } ], subtotal: 2*products[0].sellingPrice, tax:0, discount:0, total: 2*products[0].sellingPrice, paid: true });
  const inv2 = await Invoice.create({ customer: { name: 'Walk-in' }, items: [ { product: products[1]._id, quantity: 1, unitPrice: products[1].sellingPrice } ], subtotal: products[1].sellingPrice, tax:0, discount:0, total: products[1].sellingPrice, paid: true, createdAt: new Date(Date.now() - 24*3600*1000) });
  const inv3 = await Invoice.create({ customer: { name: 'Online' }, items: [ { product: products[2]._id, quantity: 3, unitPrice: products[2].sellingPrice } ], subtotal: 3*products[2].sellingPrice, tax:0, discount:0, total: 3*products[2].sellingPrice, paid: true });

  console.log('Seed done. Credentials: owner@demo.io / Owner@123, manager@demo.io / Manager@123, staff@demo.io / Staff@123');
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
