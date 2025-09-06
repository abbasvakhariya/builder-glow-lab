import { useState } from "react";
import { useInventory, Category } from "@/context/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Categories() {
  const { state, dispatch, utils } = useInventory();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const onSubmit = () => {
    if (!name.trim()) return;
    const cat: Category = { id: utils.nextId("cat"), name: name.trim() };
    dispatch({ type: "ADD_CATEGORY", payload: cat });
    setOpen(false);
    setName("");
  };

  const remove = (id: string) => dispatch({ type: "DELETE_CATEGORY", payload: id });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Categories</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="flex justify-end"><Button onClick={onSubmit}>Save</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-right"><Button variant="destructive" size="sm" onClick={() => remove(c.id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
