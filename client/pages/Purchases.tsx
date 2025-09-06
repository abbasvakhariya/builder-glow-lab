import { useState } from "react";
import { useInventory, Purchase, PurchaseItem } from "@/context/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Purchases() {
  const { state, dispatch, utils } = useInventory();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id || "");

  const addItem = () => setItems((prev) => [...prev, { productId: state.products[0]?.id || "", quantity: 1, costPrice: 0 }]);
  const updateItem = (idx: number, patch: Partial<PurchaseItem>) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = () => {
    if (!supplierId || items.length === 0) return;
    const totalCost = items.reduce((s, i) => s + i.quantity * i.costPrice, 0);
    const purchase: Purchase = { id: utils.nextId("pur"), supplierId, date: new Date().toISOString(), items, totalCost };
    dispatch({ type: "ADD_PURCHASE", payload: purchase });
    setOpen(false);
    setItems([]);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Purchases</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Purchase</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Purchase</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="" disabled>Supplier</option>
                {state.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <select className="col-span-5 h-10 rounded-md border bg-background px-3 text-sm" value={it.productId} onChange={(e) => updateItem(idx, { productId: e.target.value })}>
                      {state.products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <Input className="col-span-2" type="number" value={it.quantity as any} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                    <Input className="col-span-3" type="number" value={it.costPrice as any} onChange={(e) => updateItem(idx, { costPrice: Number(e.target.value) })} />
                    <Button className="col-span-2" variant="destructive" onClick={() => removeItem(idx)}>Remove</Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={addItem}>Add Item</Button>
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
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.purchases.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                <TableCell>{state.suppliers.find((s) => s.id === p.supplierId)?.name || "-"}</TableCell>
                <TableCell>{p.items.length}</TableCell>
                <TableCell className="text-right">${p.totalCost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
