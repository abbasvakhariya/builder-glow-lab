import { useState } from "react";
import { useInventory, User } from "@/context/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Users() {
  const { state, dispatch, utils } = useInventory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<User>>({ role: "staff" });

  const onSubmit = () => {
    if (!form.name || !form.email || !form.role) return;
    const user: User = { id: utils.nextId("usr"), name: form.name, email: form.email, role: form.role } as User;
    dispatch({ type: "ADD_USER", payload: user });
    setOpen(false);
    setForm({ role: "staff" });
  };

  const remove = (id: string) => dispatch({ type: "DELETE_USER", payload: id });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Users & Roles</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.role as any} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell className="text-right"><Button variant="destructive" size="sm" onClick={() => remove(u.id)}>Remove</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
