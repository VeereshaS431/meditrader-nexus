import { useState } from "react";
import { Plus, Edit, Trash2, Package, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { Medicine } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const emptyMed = { name: '', hsnCode: '', pack: '', category: '', manufacturer: '', avgPurchasePrice: 0, sellingPrice: 0, gstPercent: 5, currentStock: 0, reorderLevel: 20 };
const ITEMS_PER_PAGE = 10;

export default function Medicines() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useStore();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(emptyMed);
  const [editId, setEditId] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.hsnCode.includes(search)
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAdd = () => {
    if (!form.name) { toast({ title: "Error", description: "Medicine name is required", variant: "destructive" }); return; }
    addMedicine({ ...form, id: crypto.randomUUID() });
    setForm(emptyMed); setAddOpen(false);
    toast({ title: "Success", description: "Medicine added successfully" });
  };

  const handleEdit = () => {
    updateMedicine(editId, form); setEditOpen(false);
    toast({ title: "Updated", description: "Medicine updated successfully" });
  };

  const openEdit = (m: Medicine) => {
    setEditId(m.id);
    setForm({ name: m.name, hsnCode: m.hsnCode, pack: m.pack, category: m.category, manufacturer: m.manufacturer, avgPurchasePrice: m.avgPurchasePrice, sellingPrice: m.sellingPrice, gstPercent: m.gstPercent, currentStock: m.currentStock, reorderLevel: m.reorderLevel });
    setEditOpen(true);
  };

  const renderForm = (onSubmit: () => void, btnText: string) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Medicine Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. EUPEN 1GM" /></div>
        <div className="space-y-2"><Label>HSN Code</Label><Input value={form.hsnCode} onChange={e => setForm({ ...form, hsnCode: e.target.value })} placeholder="e.g. 3004" /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Pack</Label><Input value={form.pack} onChange={e => setForm({ ...form, pack: e.target.value })} placeholder="e.g. 10S" /></div>
        <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Antibiotics" /></div>
        <div className="space-y-2"><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} placeholder="e.g. Cipla" /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Purchase Price (₹)</Label><Input type="number" value={form.avgPurchasePrice || ''} onChange={e => setForm({ ...form, avgPurchasePrice: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Selling Price (₹)</Label><Input type="number" value={form.sellingPrice || ''} onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>GST %</Label><Input type="number" value={form.gstPercent || ''} onChange={e => setForm({ ...form, gstPercent: Number(e.target.value) })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Current Stock</Label><Input type="number" value={form.currentStock || ''} onChange={e => setForm({ ...form, currentStock: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel || ''} onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} /></div>
      </div>
      <Button onClick={onSubmit} className="w-full">{btnText}</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medicines</h1>
          <p className="text-muted-foreground">Manage your drug inventory & stock</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm(emptyMed); setAddOpen(true); }}><Plus className="h-4 w-4" />Add Medicine</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add New Medicine</DialogTitle></DialogHeader>{renderForm(handleAdd, "Add Medicine")}</DialogContent></Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit Medicine</DialogTitle></DialogHeader>{renderForm(handleEdit, "Update Medicine")}</DialogContent></Dialog>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Medicines', value: medicines.length, icon: Package, color: 'bg-primary/10 text-primary' },
          { label: 'In Stock', value: medicines.filter(m => m.currentStock > m.reorderLevel).length, icon: Package, color: 'bg-success/10 text-success' },
          { label: 'Low Stock', value: medicines.filter(m => m.currentStock <= m.reorderLevel && m.currentStock > 0).length, icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
          { label: 'Out of Stock', value: medicines.filter(m => m.currentStock === 0).length, icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
        ].map(item => (
          <Card key={item.label} className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${item.color.split(' ')[0]}`}><item.icon className={`h-5 w-5 ${item.color.split(' ')[1]}`} /></div>
                <div><p className="text-sm text-muted-foreground">{item.label}</p><p className="text-2xl font-bold">{item.value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search medicines..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Medicines ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead><TableHead>HSN Code</TableHead><TableHead>Pack</TableHead><TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead><TableHead>Purchase ₹</TableHead><TableHead>Selling ₹</TableHead><TableHead>GST %</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(med => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell className="font-mono text-sm">{med.hsnCode}</TableCell>
                    <TableCell>{med.pack}</TableCell>
                    <TableCell><Badge variant="secondary">{med.category}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={med.currentStock <= med.reorderLevel ? 'destructive' : 'outline'} className={med.currentStock > med.reorderLevel ? 'text-success border-success' : ''}>
                        {med.currentStock}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{med.avgPurchasePrice}</TableCell>
                    <TableCell>₹{med.sellingPrice}</TableCell>
                    <TableCell>{med.gstPercent}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(med)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { deleteMedicine(med.id); toast({ title: "Deleted", description: `${med.name} removed` }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
