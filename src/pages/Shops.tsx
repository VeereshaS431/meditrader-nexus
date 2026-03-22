import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { MedicalShop } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const emptyShop = { name: '', ownerName: '', phone: '', email: '', address: '', gstNumber: '', dlNumber: '' };
const ITEMS_PER_PAGE = 10;

export default function Shops() {
  const { shops, sales, addShop, updateShop, deleteShop } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [form, setForm] = useState(emptyShop);
  const [editId, setEditId] = useState('');
  const [viewId, setViewId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const filtered = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAdd = () => {
    if (!form.name) { toast({ title: "Error", description: "Shop name is required", variant: "destructive" }); return; }
    addShop({ ...form, id: crypto.randomUUID(), totalSales: 0, createdAt: new Date().toISOString().split('T')[0] });
    setForm(emptyShop); setAddOpen(false);
    toast({ title: "Success", description: "Shop added successfully" });
  };

  const handleEdit = () => {
    updateShop(editId, form); setEditOpen(false);
    toast({ title: "Updated", description: "Shop updated successfully" });
  };

  const handleDelete = (id: string, name: string) => {
    deleteShop(id);
    toast({ title: "Deleted", description: `${name} has been removed` });
  };

  const openEdit = (s: MedicalShop) => {
    setEditId(s.id);
    setForm({ name: s.name, ownerName: s.ownerName, phone: s.phone, email: s.email, address: s.address, gstNumber: s.gstNumber || '', dlNumber: s.dlNumber || '' });
    setEditOpen(true);
  };

  const shopSales = sales.filter(s => s.shopId === viewId);
  const viewShop = shops.find(s => s.id === viewId);

  const shopCreditSales = shopSales.filter(s => s.paymentMode === 'credit');
  const totalPending = shopCreditSales.reduce((s, sale) => s + (sale.netPayable - sale.paidAmount), 0);
  const totalReceived = shopSales.reduce((s, sale) => s + sale.paidAmount, 0);

  const renderForm = (onSubmit: () => void, btnText: string) => (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Shop Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Shop name" /></div>
      <div className="space-y-2"><Label>Owner Name</Label><Input value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner name" /></div>
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
          <h1 className="text-3xl font-bold">Medical Shops</h1>
          <p className="text-muted-foreground">Manage your client medical shops</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm(emptyShop); setAddOpen(true); }}><Plus className="h-4 w-4" />Add Shop</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search shops..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add New Medical Shop</DialogTitle></DialogHeader>{renderForm(handleAdd, "Add Shop")}</DialogContent></Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit Medical Shop</DialogTitle></DialogHeader>{renderForm(handleEdit, "Update Shop")}</DialogContent></Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewShop?.name} - Sales History</DialogTitle></DialogHeader>
          {viewShop && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 rounded-lg bg-muted p-4">
                <div><p className="text-sm text-muted-foreground">Owner</p><p className="font-medium">{viewShop.ownerName}</p></div>
                <div><p className="text-sm text-muted-foreground">GST</p><p className="font-medium font-mono text-xs">{viewShop.gstNumber || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Received</p><p className="font-medium text-success">₹{totalReceived.toLocaleString()}</p></div>
                <div><p className="text-sm text-muted-foreground">Pending</p><p className="font-medium text-destructive">₹{totalPending.toLocaleString()}</p></div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead><TableHead>Net Payable</TableHead><TableHead>Mode</TableHead><TableHead>Received</TableHead><TableHead>Pending</TableHead></TableRow></TableHeader>
                <TableBody>
                  {shopSales.map(sale => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">{sale.invoiceNumber}</TableCell>
                      <TableCell>{new Date(sale.saleDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{sale.items.length} items</TableCell>
                      <TableCell>₹{sale.netPayable.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={sale.paymentMode === 'cash' ? 'secondary' : 'outline'}>{sale.paymentMode}</Badge></TableCell>
                      <TableCell className="text-success">₹{sale.paidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-destructive">₹{(sale.netPayable - sale.paidAmount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {shopSales.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No sales found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Medical Shops ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead><TableHead>Owner</TableHead><TableHead>Phone</TableHead>
                  <TableHead>GST Number</TableHead><TableHead>Total Sales</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(shop => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.ownerName}</TableCell>
                    <TableCell>{shop.phone}</TableCell>
                    <TableCell className="font-mono text-xs">{shop.gstNumber || '-'}</TableCell>
                    <TableCell><Badge className="bg-success text-success-foreground">₹{shop.totalSales.toLocaleString()}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setViewId(shop.id); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(shop)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(shop.id, shop.name)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
