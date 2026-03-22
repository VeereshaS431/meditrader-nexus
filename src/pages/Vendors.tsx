import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Eye, Search, IndianRupee, TrendingDown, CheckCircle, Clock } from "lucide-react";
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
const ITEMS_PER_PAGE = 10;

export default function Vendors() {
  const { vendors, purchases, addVendor, updateVendor, deleteVendor, addPurchasePayment } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  // payMode: 'invoice' = from view dialog for a specific invoice, 'direct' = standalone Record Payment
  const [payOpen, setPayOpen] = useState(false);
  const [payMode, setPayMode] = useState<'invoice' | 'direct'>('invoice');
  const [form, setForm] = useState(emptyVendor);
  const [editId, setEditId] = useState('');
  const [viewId, setViewId] = useState('');
  const [payId, setPayId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payNotes, setPayNotes] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  // for direct payment: pick vendor then pick invoice
  const [directVendorId, setDirectVendorId] = useState('');
  const [directInvoiceId, setDirectInvoiceId] = useState('');
  const [directVendorSearch, setDirectVendorSearch] = useState('');
  const [directVendorOpen, setDirectVendorOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  // Summary totals across all vendors
  const grandTotals = useMemo(() => {
    const totalPurchases = purchases.reduce((s, p) => s + p.netPayable, 0);
    const totalPaid = purchases.reduce((s, p) => s + p.paidAmount, 0);
    const totalPending = purchases.reduce((s, p) => s + (p.netPayable - p.paidAmount), 0);
    return { totalPurchases, totalPaid, totalPending };
  }, [purchases]);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    (v.gstNumber || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const vendorFinancials = (vendorId: string) => {
    const vp = purchases.filter(p => p.vendorId === vendorId);
    const total = vp.reduce((s, p) => s + p.netPayable, 0);
    const paid = vp.reduce((s, p) => s + p.paidAmount, 0);
    const pending = vp.reduce((s, p) => s + (p.netPayable - p.paidAmount), 0);
    return { total, paid, pending };
  };

  // Pending invoices for direct payment flow
  const pendingInvoicesForVendor = useMemo(() =>
    purchases.filter(p => p.vendorId === directVendorId && p.paymentMode === 'credit' && p.paidAmount < p.netPayable),
    [purchases, directVendorId]
  );

  const filteredDirectVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(directVendorSearch.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name) { toast({ title: "Error", description: "Vendor name is required", variant: "destructive" }); return; }
    addVendor({ ...form, id: crypto.randomUUID(), totalPurchases: 0, createdAt: new Date().toISOString().split('T')[0] });
    setForm(emptyVendor); setAddOpen(false);
    toast({ title: "Success", description: "Vendor added successfully" });
  };

  const handleEdit = () => {
    if (!form.name) { toast({ title: "Error", description: "Vendor name is required", variant: "destructive" }); return; }
    updateVendor(editId, form); setForm(emptyVendor); setEditOpen(false);
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

  const handlePayment = () => {
    if (payAmount <= 0) { toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" }); return; }
    const targetId = payMode === 'invoice' ? payId : directInvoiceId;
    const purchase = purchases.find(p => p.id === targetId);
    if (!purchase) { toast({ title: "Error", description: "Select an invoice", variant: "destructive" }); return; }
    const pending = purchase.netPayable - purchase.paidAmount;
    if (payAmount > pending) { toast({ title: "Error", description: `Amount exceeds pending ₹${pending.toLocaleString()}`, variant: "destructive" }); return; }
    addPurchasePayment(targetId, { id: crypto.randomUUID(), date: payDate, amount: payAmount, notes: payNotes });
    setPayOpen(false); setPayAmount(0); setPayNotes(''); setPayDate(new Date().toISOString().split('T')[0]);
    setDirectVendorId(''); setDirectInvoiceId(''); setDirectVendorSearch('');
    toast({ title: "Payment Recorded", description: `₹${payAmount.toLocaleString()} paid successfully` });
  };

  const openDirectPay = () => {
    setPayMode('direct');
    setDirectVendorId(''); setDirectInvoiceId(''); setDirectVendorSearch('');
    setPayAmount(0); setPayNotes(''); setPayDate(new Date().toISOString().split('T')[0]);
    setPayOpen(true);
  };

  const openInvoicePay = (purchaseId: string) => {
    setPayMode('invoice');
    setPayId(purchaseId);
    setPayAmount(0); setPayNotes(''); setPayDate(new Date().toISOString().split('T')[0]);
    setPayOpen(true);
  };

  const vendorPurchases = purchases.filter(p => p.vendorId === viewId);
  const viewVendor = vendors.find(v => v.id === viewId);
  const viewTotalPurchases = vendorPurchases.reduce((s, p) => s + p.netPayable, 0);
  const viewTotalPaid = vendorPurchases.reduce((s, p) => s + p.paidAmount, 0);
  const viewTotalPending = vendorPurchases.reduce((s, p) => s + (p.netPayable - p.paidAmount), 0);

  const selectedDirectInvoice = purchases.find(p => p.id === directInvoiceId);

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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={openDirectPay}><IndianRupee className="h-4 w-4" />Record Payment</Button>
          <Button className="gap-2" onClick={() => { setForm(emptyVendor); setAddOpen(true); }}><Plus className="h-4 w-4" />Add Vendor</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2"><TrendingDown className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="text-2xl font-bold">₹{grandTotals.totalPurchases.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Total Paid</p>
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
        <Input placeholder="Search vendors..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>{renderForm(handleAdd, "Add Vendor")}</DialogContent></Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit Vendor</DialogTitle></DialogHeader>{renderForm(handleEdit, "Update Vendor")}</DialogContent></Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{payMode === 'direct' ? 'Record Payment to Vendor' : 'Record Payment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {payMode === 'direct' && (
              <>
                {/* Vendor searchable dropdown */}
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search vendor..."
                      value={directVendorId ? (vendors.find(v => v.id === directVendorId)?.name || directVendorSearch) : directVendorSearch}
                      onChange={e => { setDirectVendorSearch(e.target.value); setDirectVendorId(''); setDirectInvoiceId(''); setDirectVendorOpen(true); }}
                      onFocus={() => setDirectVendorOpen(true)}
                    />
                    {directVendorOpen && !directVendorId && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                        {filteredDirectVendors.length === 0
                          ? <div className="px-3 py-2 text-sm text-muted-foreground">No vendors found</div>
                          : filteredDirectVendors.map(v => (
                            <div key={v.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                              onMouseDown={() => { setDirectVendorId(v.id); setDirectVendorSearch(v.name); setDirectVendorOpen(false); setDirectInvoiceId(''); }}>
                              <span className="font-medium">{v.name}</span>
                              <span className="text-muted-foreground ml-2 text-xs">{v.contactPerson}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Invoice picker */}
                {directVendorId && (
                  <div className="space-y-2">
                    <Label>Invoice (credit, pending only)</Label>
                    {pendingInvoicesForVendor.length === 0
                      ? <p className="text-sm text-muted-foreground p-2 border rounded-md">No pending credit invoices for this vendor</p>
                      : <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                          {pendingInvoicesForVendor.map(p => (
                            <div key={p.id}
                              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent text-sm ${directInvoiceId === p.id ? 'bg-accent' : ''}`}
                              onClick={() => setDirectInvoiceId(p.id)}>
                              <div>
                                <span className="font-medium font-mono">{p.invoiceNumber}</span>
                                <span className="text-muted-foreground ml-2">{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-destructive font-medium">₹{(p.netPayable - p.paidAmount).toLocaleString()} pending</span>
                              </div>
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
              const p = purchases.find(x => x.id === payId);
              return p ? (
                <div className="rounded-md bg-muted px-3 py-2 text-sm flex justify-between">
                  <span className="text-muted-foreground">Invoice {p.invoiceNumber} — pending</span>
                  <span className="font-bold text-destructive">₹{(p.netPayable - p.paidAmount).toLocaleString()}</span>
                </div>
              ) : null;
            })()}
            <div className="space-y-2"><Label>Amount ₹</Label><Input type="number" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} placeholder="Enter amount paid" /></div>
            <div className="space-y-2"><Label>Payment Date</Label><Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Notes</Label><Input value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="e.g. Week 2 payment" /></div>
            <Button onClick={handlePayment} className="w-full">Record Payment</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewVendor?.name} — Purchase History</DialogTitle></DialogHeader>
          {viewVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 rounded-lg bg-muted p-4">
                <div><p className="text-sm text-muted-foreground">Contact</p><p className="font-medium">{viewVendor.contactPerson}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Purchases</p><p className="font-bold text-blue-600">₹{viewTotalPurchases.toLocaleString()}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Paid</p><p className="font-bold text-green-600">₹{viewTotalPaid.toLocaleString()}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Pending</p><p className="font-bold text-destructive">₹{viewTotalPending.toLocaleString()}</p></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead>
                    <TableHead>Net Payable</TableHead><TableHead>Mode</TableHead><TableHead>Paid</TableHead>
                    <TableHead>Pending</TableHead><TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorPurchases.map(p => {
                    const pending = p.netPayable - p.paidAmount;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-sm">{p.invoiceNumber}</TableCell>
                        <TableCell>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{p.items.length} items</TableCell>
                        <TableCell>₹{p.netPayable.toLocaleString()}</TableCell>
                        <TableCell><Badge variant={p.paymentMode === 'cash' ? 'secondary' : 'outline'}>{p.paymentMode}</Badge></TableCell>
                        <TableCell className="text-green-600 font-medium">₹{p.paidAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          {pending > 0
                            ? <span className="text-destructive font-medium">₹{pending.toLocaleString()}</span>
                            : <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>}
                        </TableCell>
                        <TableCell>
                          {p.paymentMode === 'credit' && pending > 0 && (
                            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => openInvoicePay(p.id)}>
                              <IndianRupee className="h-3 w-3" />Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {vendorPurchases.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No purchases found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Vendors ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead><TableHead>Contact Person</TableHead><TableHead>Phone</TableHead>
                  <TableHead>GST Number</TableHead><TableHead>Total Purchases</TableHead><TableHead>Paid</TableHead><TableHead>Pending</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(v => {
                  const { total, paid, pending } = vendorFinancials(v.id);
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell>{v.contactPerson}</TableCell>
                      <TableCell>{v.phone}</TableCell>
                      <TableCell className="font-mono text-xs">{v.gstNumber || '-'}</TableCell>
                      <TableCell><span className="font-medium text-blue-600">₹{total.toLocaleString()}</span></TableCell>
                      <TableCell><span className="text-green-600 font-medium">₹{paid.toLocaleString()}</span></TableCell>
                      <TableCell>
                        {pending > 0
                          ? <Badge variant="destructive">₹{pending.toLocaleString()}</Badge>
                          : <Badge variant="secondary">₹0</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setViewId(v.id); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id, v.name)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
