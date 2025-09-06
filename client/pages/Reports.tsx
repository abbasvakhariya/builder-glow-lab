import { useMemo, useState } from "react";
import { useInventory } from "@/context/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Reports() {
  const { state } = useInventory();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"sales" | "purchases">("sales");

  const filtered = useMemo(() => {
    const f = from ? new Date(from) : null;
    const t = to ? new Date(to) : null;
    if (type === "sales") {
      return state.sales.filter((s) => (!f || new Date(s.date) >= f) && (!t || new Date(s.date) <= t));
    }
    return state.purchases.filter((p) => (!f || new Date(p.date) >= f) && (!t || new Date(p.date) <= t));
  }, [state, from, to, type]);

  const total = type === "sales" ? filtered.reduce((sum, r) => sum + r.totalAmount, 0) : filtered.reduce((sum, r) => sum + r.totalCost, 0);

  const exportCSV = () => {
    const rows = [
      type === "sales" ? ["Date", "Items", "Discount", "Tax", "Total"] : ["Date", "Supplier", "Items", "Total"],
      ...filtered.map((r) =>
        type === "sales"
          ? [new Date(r.date).toLocaleDateString(), String(r.items.length), String(r.discount || 0), String(r.tax || 0), String(r.totalAmount)]
          : [new Date(r.date).toLocaleDateString(), String(state.suppliers.find(s => s.id === r.supplierId)?.name || "-"), String(r.items.length), String(r.totalCost)],
      ),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Reports</CardTitle>
        <div className="flex gap-2">
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="sales">Sales</option>
            <option value="purchases">Purchases</option>
          </select>
          <input type="date" className="h-10 rounded-md border bg-background px-3 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="h-10 rounded-md border bg-background px-3 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {type === "sales" ? (
                <>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={"date" in r ? r.id : (r as any).id}>
                {type === "sales" ? (
                  <>
                    <TableCell>{new Date((r as any).date).toLocaleDateString()}</TableCell>
                    <TableCell>{(r as any).items.length}</TableCell>
                    <TableCell>${((r as any).discount || 0).toFixed(2)}</TableCell>
                    <TableCell>${((r as any).tax || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(r as any).totalAmount.toFixed(2)}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{new Date((r as any).date).toLocaleDateString()}</TableCell>
                    <TableCell>{state.suppliers.find(s => s.id === (r as any).supplierId)?.name || "-"}</TableCell>
                    <TableCell>{(r as any).items.length}</TableCell>
                    <TableCell className="text-right">${(r as any).totalCost.toFixed(2)}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-medium">Total: ${total.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
