import { useState } from "react";
import { Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { Vendor } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const emptyVendor = { name: '', contactPerson: '', phone: '', email: '', address: '', gstNumber: '', dlNumber: '' };

export default function Vendors() {
  const { vendors, purchases, addVendor, updateVendor, deleteVendor } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [form, setForm] = useState(emptyVendor);
  const [editId, setEditId] = useState('');
  const [viewId, setViewId] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (!form.name) { toast({ title: "Error", description: "Vendor name is required", variant: "destructive" }); return; }
    addVendor({ ...form, id: crypto.randomUUID(), totalPurchases: 0, createdAt: new Date().toISOString().split('T')[0] });
    setForm(emptyVendor);
    setAddOpen(false);
    toast({ title: "Success", description: "Vendor added successfully" });
  };

  const handleEdit = () => {
    if (!form.name) { toast({ title: "Error", description: "Vendor name is required", variant: "destructive" }); return; }
    updateVendor(editId, form);
    setForm(emptyVendor);
    setEditOpen(false);
    toast({ title: "Updated", description: "Vendor updated successfully" });
  };

  const handleDelete = (id: string, name: string) => {
    deleteVendor(id);
    toast({ title: "Deleted", description: `${name} has been removed` });
  };

  const openEdit = (v: Vendor) => {
    setEditId(v.id);
    setForm({ name: v.name, contactPerson: v.contactPerson, phone: v.phone, email: v.email, address: v.address, gstNumber: v.gstNumber || '', dlNumber: v.dlNumber || '' });
    setEditOpen(true);
  };

  const vendorPurchases = purchases.filter(p => p.vendorId === viewId);
  const viewVendor = vendors.find(v => v.id === viewId);

  const renderForm = (onSubmit: () => void, btnText: string) => (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Vendor Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter vendor name" /></div>
      <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} placeholder="Contact person" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" /></div>
        <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" /></div>
      </div>
      <div className="space-y-2"><Label>GST Number</Label><Input value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} placeholder="GST Number" /></div>
      <div className="space-y-2"><Label>D.L. Number</Label><Input value={form.dlNumber} onChange={e => setForm({ ...form, dlNumber: e.target.value })} placeholder="D.L. Number" /></div>
      <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" /></div>
      <Button onClick={onSubmit} className="w-full">{btnText}</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">Manage your supplier vendors</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm(emptyVendor); setAddOpen(true); }}><Plus className="h-4 w-4" />Add Vendor</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
          {renderForm(handleAdd, "Add Vendor")}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Vendor</DialogTitle></DialogHeader>
          {renderForm(handleEdit, "Update Vendor")}
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewVendor?.name} - Purchase History</DialogTitle></DialogHeader>
          {viewVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
                <div><p className="text-sm text-muted-foreground">Contact</p><p className="font-medium">{viewVendor.contactPerson}</p></div>
                <div><p className="text-sm text-muted-foreground">GST</p><p className="font-medium font-mono text-xs">{viewVendor.gstNumber || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Purchases</p><p className="font-medium">₹{viewVendor.totalPurchases.toLocaleString()}</p></div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead><TableHead>Net Payable</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vendorPurchases.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.invoiceNumber}</TableCell>
                      <TableCell>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{p.items.length} items</TableCell>
                      <TableCell>₹{p.netPayable.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {vendorPurchases.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No purchases found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Vendors ({vendors.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.contactPerson}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell className="font-mono text-xs">{v.gstNumber || '-'}</TableCell>
                    <TableCell><Badge variant="secondary">₹{v.totalPurchases.toLocaleString()}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setViewId(v.id); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id, v.name)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
