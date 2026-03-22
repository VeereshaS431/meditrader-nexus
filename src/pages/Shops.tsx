import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Eye, Search, IndianRupee, TrendingUp, CheckCircle, Clock } from "lucide-react";
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
  const { shops, sales, addShop, updateShop, deleteShop, addSalePayment } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payMode, setPayMode] = useState<'invoice' | 'direct'>('invoice');
  const [form, setForm] = useState(emptyShop);
  const [editId, setEditId] = useState('');
  const [viewId, setViewId] = useState('');
  const [payId, setPayId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payNotes, setPayNotes] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [directShopId, setDirectShopId] = useState('');
  const [directInvoiceId, setDirectInvoiceId] = useState('');
  const [directShopSearch, setDirectShopSearch] = useState('');
  const [directShopOpen, setDirectShopOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const grandTotals = useMemo(() => {
    const totalSales = sales.reduce((s, sale) => s + sale.netPayable, 0);
    const totalPaid = sales.reduce((s, sale) => s + sale.paidAmount, 0);
    const totalPending = sales.reduce((s, sale) => s + (sale.netPayable - sale.paidAmount), 0);
    return { totalSales, totalPaid, totalPending };
  }, [sales]);

  const filtered = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const shopFinancials = (shopId: string) => {
    const sl = sales.filter(s => s.shopId === shopId);
    const total = sl.reduce((s, sale) => s + sale.netPayable, 0);
    const paid = sl.reduce((s, sale) => s + sale.paidAmount, 0);
    const pending = sl.reduce((s, sale) => s + (sale.netPayable - sale.paidAmount), 0);
    return { total, paid, pending };
  };

  const pendingInvoicesForShop = useMemo(() =>
    sales.filter(s => s.shopId === directShopId && s.paymentMode === 'credit' && s.paidAmount < s.netPayable),
    [sales, directShopId]
  );

  const filteredDirectShops = shops.filter(s =>
    s.name.toLowerCase().includes(directShopSearch.toLowerCase())
  );

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

  const handlePayment = () => {
    if (payAmount <= 0) { toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" }); return; }
    const targetId = payMode === 'invoice' ? payId : directInvoiceId;
    const sale = sales.find(s => s.id === targetId);
    if (!sale) { toast({ title: "Error", description: "Select an invoice", variant: "destructive" }); return; }
    const pending = sale.netPayable - sale.paidAmount;
    if (payAmount > pending) { toast({ title: "Error", description: `Amount exceeds pending ₹${pending.toLocaleString()}`, variant: "destructive" }); return; }
    addSalePayment(targetId, { id: crypto.randomUUID(), date: payDate, amount: payAmount, notes: payNotes });
    setPayOpen(false); setPayAmount(0); setPayNotes(''); setPayDate(new Date().toISOString().split('T')[0]);
    setDirectShopId(''); setDirectInvoiceId(''); setDirectShopSearch('');
    toast({ title: "Payment Recorded", description: `₹${payAmount.toLocaleString()} received successfully` });
  };

  const openDirectPay = () => {
    setPayMode('direct');
    setDirectShopId(''); setDirectInvoiceId(''); setDirectShopSearch('');
    setPayAmount(0); setPayNotes(''); setPayDate(new Date().toISOString().split('T')[0]);
    setPayOpen(true);
  };

  const openInvoicePay = (saleId: string) => {
    setPayMode('invoice');
    setPayId(saleId);
    setPayAmount(0); setPayNotes(''); setPayDate(new Date().toISOString().split('T')[0]);
    setPayOpen(true);
  };

  const shopSales = sales.filter(s => s.shopId === viewId);
  const viewShop = shops.find(s => s.id === viewId);
  const viewTotalSales = shopSales.reduce((s, sale) => s + sale.netPayable, 0);
  const viewTotalPaid = shopSales.reduce((s, sale) => s + sale.paidAmount, 0);
  const viewTotalPending = shopSales.reduce((s, sale) => s + (sale.netPayable - sale.paidAmount), 0);

  const selectedDirectInvoice = sales.find(s => s.id === directInvoiceId);

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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={openDirectPay}><IndianRupee className="h-4 w-4" />Record Payment</Button>
          <Button className="gap-2" onClick={() => { setForm(emptyShop); setAddOpen(true); }}><Plus className="h-4 w-4" />Add Shop</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">₹{grandTotals.totalSales.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="text-2xl font-bold text-green-600">₹{grandTotals.totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2"><Clock className="h-5 w-5 text-red-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending</p>
                  <p className="text-2xl font-bold text-red-600">₹{grandTotals.totalPending.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search shops..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add New Medical Shop</DialogTitle></DialogHeader>{renderForm(handleAdd, "Add Shop")}</DialogContent></Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit Medical Shop</DialogTitle></DialogHeader>{renderForm(handleEdit, "Update Shop")}</DialogContent></Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{payMode === 'direct' ? 'Record Payment Received' : 'Record Payment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {payMode === 'direct' && (
              <>
                <div className="space-y-2">
                  <Label>Medical Shop</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search shop..."
                      value={directShopId ? (shops.find(s => s.id === directShopId)?.name || directShopSearch) : directShopSearch}
                      onChange={e => { setDirectShopSearch(e.target.value); setDirectShopId(''); setDirectInvoiceId(''); setDirectShopOpen(true); }}
                      onFocus={() => setDirectShopOpen(true)}
                    />
                    {directShopOpen && !directShopId && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                        {filteredDirectShops.length === 0
                          ? <div className="px-3 py-2 text-sm text-muted-foreground">No shops found</div>
                          : filteredDirectShops.map(s => (
                            <div key={s.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                              onMouseDown={() => { setDirectShopId(s.id); setDirectShopSearch(s.name); setDirectShopOpen(false); setDirectInvoiceId(''); }}>
                              <span className="font-medium">{s.name}</span>
                              <span className="text-muted-foreground ml-2 text-xs">{s.ownerName}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                {directShopId && (
                  <div className="space-y-2">
                    <Label>Invoice (credit, pending only)</Label>
                    {pendingInvoicesForShop.length === 0
                      ? <p className="text-sm text-muted-foreground p-2 border rounded-md">No pending credit invoices for this shop</p>
                      : <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                          {pendingInvoicesForShop.map(s => (
                            <div key={s.id}
                              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent text-sm ${directInvoiceId === s.id ? 'bg-accent' : ''}`}
                              onClick={() => setDirectInvoiceId(s.id)}>
                              <div>
                                <span className="font-medium font-mono">{s.invoiceNumber}</span>
                                <span className="text-muted-foreground ml-2">{new Date(s.saleDate).toLocaleDateString('en-IN')}</span>
                              </div>
                              <span className="text-destructive font-medium">₹{(s.netPayable - s.paidAmount).toLocaleString()} pending</span>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                )}
                {selectedDirectInvoice && (
                  <div className="rounded-md bg-muted px-3 py-2 text-sm flex justify-between">
                    <span className="text-muted-foreground">Pending on {selectedDirectInvoice.invoiceNumber}</span>
                    <span className="font-bold text-destructive">₹{(selectedDirectInvoice.netPayable - selectedDirectInvoice.paidAmount).toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
            {payMode === 'invoice' && (() => {
              const s = sales.find(x => x.id === payId);
              return s ? (
                <div className="rounded-md bg-muted px-3 py-2 text-sm flex justify-between">
                  <span className="text-muted-foreground">Invoice {s.invoiceNumber} — pending</span>
                  <span className="font-bold text-destructive">₹{(s.netPayable - s.paidAmount).toLocaleString()}</span>
                </div>
              ) : null;
            })()}
            <div className="space-y-2"><Label>Amount ₹</Label><Input type="number" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} placeholder="Enter amount received" /></div>
            <div className="space-y-2"><Label>Payment Date</Label><Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Notes</Label><Input value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="e.g. Week 2 payment" /></div>
            <Button onClick={handlePayment} className="w-full">Record Payment</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewShop?.name} — Sales History</DialogTitle></DialogHeader>
          {viewShop && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 rounded-lg bg-muted p-4">
                <div><p className="text-sm text-muted-foreground">Owner</p><p className="font-medium">{viewShop.ownerName}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Sales</p><p className="font-bold text-blue-600">₹{viewTotalSales.toLocaleString()}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Received</p><p className="font-bold text-green-600">₹{viewTotalPaid.toLocaleString()}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Pending</p><p className="font-bold text-destructive">₹{viewTotalPending.toLocaleString()}</p></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead>
                    <TableHead>Net Payable</TableHead><TableHead>Mode</TableHead><TableHead>Received</TableHead>
                    <TableHead>Pending</TableHead><TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopSales.map(sale => {
                    const pending = sale.netPayable - sale.paidAmount;
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-sm">{sale.invoiceNumber}</TableCell>
                        <TableCell>{new Date(sale.saleDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{sale.items.length} items</TableCell>
                        <TableCell>₹{sale.netPayable.toLocaleString()}</TableCell>
                        <TableCell><Badge variant={sale.paymentMode === 'cash' ? 'secondary' : 'outline'}>{sale.paymentMode}</Badge></TableCell>
                        <TableCell className="text-green-600 font-medium">₹{sale.paidAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          {pending > 0
                            ? <span className="text-destructive font-medium">₹{pending.toLocaleString()}</span>
                            : <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>}
                        </TableCell>
                        <TableCell>
                          {sale.paymentMode === 'credit' && pending > 0 && (
                            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => openInvoicePay(sale.id)}>
                              <IndianRupee className="h-3 w-3" />Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {shopSales.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No sales found</TableCell></TableRow>}
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
                  <TableHead>GST Number</TableHead><TableHead>Total Sales</TableHead><TableHead>Received</TableHead><TableHead>Pending</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(shop => {
                  const { total, paid, pending } = shopFinancials(shop.id);
                  return (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.ownerName}</TableCell>
                      <TableCell>{shop.phone}</TableCell>
                      <TableCell className="font-mono text-xs">{shop.gstNumber || '-'}</TableCell>
                      <TableCell><span className="font-medium text-blue-600">₹{total.toLocaleString()}</span></TableCell>
                      <TableCell><span className="text-green-600 font-medium">₹{paid.toLocaleString()}</span></TableCell>
                      <TableCell>
                        {pending > 0
                          ? <Badge variant="destructive">₹{pending.toLocaleString()}</Badge>
                          : <Badge variant="secondary">₹0</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setViewId(shop.id); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(shop)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(shop.id, shop.name)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
