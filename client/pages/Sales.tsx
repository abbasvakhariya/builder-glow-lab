import { useState } from "react";
import { useInventory, Sale, SaleItem } from "@/context/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Sales() {
  const { state, dispatch, utils } = useInventory();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const addItem = () => setItems((prev) => [...prev, { productId: state.products[0]?.id || "", quantity: 1, price: 0 }]);
  const updateItem = (idx: number, patch: Partial<SaleItem>) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const totalAmount = subtotal - discount + tax;

  const onSubmit = () => {
    if (items.length === 0) return;
    const sale: Sale = { id: utils.nextId("sale"), date: new Date().toISOString(), items, discount, tax, totalAmount };
    dispatch({ type: "ADD_SALE", payload: sale });
    setOpen(false);
    setItems([]);
    setDiscount(0);
    setTax(0);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Sales</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Sale</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Sale</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <select className="col-span-5 h-10 rounded-md border bg-background px-3 text-sm" value={it.productId} onChange={(e) => updateItem(idx, { productId: e.target.value, price: state.products.find(p => p.id === e.target.value)?.sellingPrice || it.price })}>
                      {state.products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <Input className="col-span-2" type="number" value={it.quantity as any} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                    <Input className="col-span-3" type="number" value={it.price as any} onChange={(e) => updateItem(idx, { price: Number(e.target.value) })} />
                    <Button className="col-span-2" variant="destructive" onClick={() => removeItem(idx)}>Remove</Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={addItem}>Add Item</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Discount" type="number" value={discount as any} onChange={(e) => setDiscount(Number(e.target.value))} />
                <Input placeholder="Tax" type="number" value={tax as any} onChange={(e) => setTax(Number(e.target.value))} />
                <div className="h-10 flex items-center justify-end font-medium">Total: ${totalAmount.toFixed(2)}</div>
              </div>
              <div className="flex justify-end">
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
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.sales.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
                <TableCell>{s.items.length}</TableCell>
                <TableCell>${(s.discount || 0).toFixed(2)}</TableCell>
                <TableCell>${(s.tax || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">${s.totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
