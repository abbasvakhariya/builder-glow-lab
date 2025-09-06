import { useState } from "react";
import { useInventory, Product } from "@/context/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Products() {
  const { state, dispatch, utils } = useInventory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({ unit: "pcs", lowStockThreshold: 10 });

  const onSubmit = () => {
    if (!form.name || !form.categoryId || !form.sku || !form.costPrice || !form.sellingPrice) return;
    const product: Product = {
      id: utils.nextId("prod"),
      name: form.name,
      sku: form.sku,
      categoryId: form.categoryId,
      unit: form.unit || "pcs",
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      stock: Number(form.stock || 0),
      supplierId: form.supplierId,
      lowStockThreshold: Number(form.lowStockThreshold || 0),
      expiryDate: form.expiryDate || null,
    };
    dispatch({ type: "ADD_PRODUCT", payload: product });
    setOpen(false);
    setForm({ unit: "pcs", lowStockThreshold: 10 });
  };

  const remove = (id: string) => dispatch({ type: "DELETE_PRODUCT", payload: id });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Product</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="SKU" value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="" disabled>Category</option>
                {state.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.supplierId || ""} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Supplier (optional)</option>
                {state.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Input placeholder="Unit (e.g., pcs, kg)" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              <Input placeholder="Cost Price" type="number" value={form.costPrice as any || ""} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
              <Input placeholder="Selling Price" type="number" value={form.sellingPrice as any || ""} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} />
              <Input placeholder="Initial Stock" type="number" value={form.stock as any || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              <Input placeholder="Low Stock Threshold" type="number" value={form.lowStockThreshold as any || ""} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />
              <Input placeholder="Expiry Date (YYYY-MM-DD)" value={form.expiryDate as any || ""} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={onSubmit}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>{state.categories.find((c) => c.id === p.categoryId)?.name || "-"}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>${p.sellingPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
