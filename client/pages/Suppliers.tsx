import { useState } from "react";
import { useInventory, Supplier } from "@/context/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Suppliers() {
  const { state, dispatch, utils } = useInventory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Supplier>>({});

  const onSubmit = () => {
    if (!form.name) return;
    const sup: Supplier = { id: utils.nextId("sup"), name: form.name, contact: form.contact, phone: form.phone, email: form.email, address: form.address } as Supplier;
    dispatch({ type: "ADD_SUPPLIER", payload: sup });
    setOpen(false);
    setForm({});
  };

  const remove = (id: string) => dispatch({ type: "DELETE_SUPPLIER", payload: id });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Suppliers</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Supplier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Contact" value={form.contact || ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <Input placeholder="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="md:col-span-2 flex justify-end"><Button onClick={onSubmit}>Save</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.phone || "-"}</TableCell>
                <TableCell>{s.email || "-"}</TableCell>
                <TableCell className="text-right"><Button variant="destructive" size="sm" onClick={() => remove(s.id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
