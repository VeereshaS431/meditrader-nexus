import { useState } from "react";
import { Plus, Edit, Trash2, FileText, Package, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockMedicines } from "@/lib/mockData";
import { Medicine } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.hsnCode.includes(search)
  );

  const handleAdd = () => {
    toast({ title: "Success", description: "Medicine added successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medicines</h1>
          <p className="text-muted-foreground">Manage your drug inventory & stock</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Medicine</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Medicine</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Medicine Name</Label><Input placeholder="e.g. EUPEN 1GM" /></div>
                <div className="space-y-2"><Label>HSN Code</Label><Input placeholder="e.g. 3004" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Pack</Label><Input placeholder="e.g. 10S" /></div>
                <div className="space-y-2"><Label>Category</Label><Input placeholder="e.g. Antibiotics" /></div>
                <div className="space-y-2"><Label>Manufacturer</Label><Input placeholder="e.g. Cipla" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Purchase Price (₹)</Label><Input type="number" placeholder="0" /></div>
                <div className="space-y-2"><Label>Selling Price (₹)</Label><Input type="number" placeholder="0" /></div>
                <div className="space-y-2"><Label>GST %</Label><Input type="number" placeholder="5" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Opening Stock</Label><Input type="number" placeholder="0" /></div>
                <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" placeholder="20" /></div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Medicine</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><Package className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Medicines</p>
                <p className="text-2xl font-bold">{medicines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2"><Package className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">{medicines.filter(m => m.currentStock > m.reorderLevel).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2"><AlertTriangle className="h-5 w-5 text-warning" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{medicines.filter(m => m.currentStock <= m.reorderLevel && m.currentStock > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{medicines.filter(m => m.currentStock === 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Medicines ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>HSN Code</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Purchase ₹</TableHead>
                  <TableHead>Selling ₹</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell className="font-mono text-sm">{med.hsnCode}</TableCell>
                    <TableCell>{med.pack}</TableCell>
                    <TableCell><Badge variant="secondary">{med.category}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={med.currentStock <= med.reorderLevel ? 'destructive' : 'outline'}
                        className={med.currentStock > med.reorderLevel ? 'text-success border-success' : ''}>
                        {med.currentStock}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{med.avgPurchasePrice}</TableCell>
                    <TableCell>₹{med.sellingPrice}</TableCell>
                    <TableCell>{med.gstPercent}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
