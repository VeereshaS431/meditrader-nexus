import { useState } from "react";
import { Plus, Trash2, Eye, X, Search, CreditCard, Banknote, IndianRupee, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/lib/store";
import { PurchaseItem } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface LineItem {
  medicineId: string;
  batch: string;
  quantity: number;
  freeQty: number;
  expiryDate: string;
  mrp: number;
  rate: number;
}

const emptyItem = (): LineItem => ({ medicineId: '', batch: '', quantity: 0, freeQty: 0, expiryDate: '', mrp: 0, rate: 0 });

const ITEMS_PER_PAGE = 10;

const emptyNewMed = { name: '', hsnCode: '', pack: '', category: '', manufacturer: '', gstPercent: 5, sellingPrice: 0 };

export default function Purchases() {
  const { purchases, vendors, medicines, addPurchase, updatePurchase, deletePurchase, addPurchasePayment, addMedicine } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payId, setPayId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payNotes, setPayNotes] = useState('');
  const [viewId, setViewId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'credit'>('cash');
  const { toast } = useToast();

  // Filters
  const [search, setSearch] = useState('');
  const [filterVendor, setFilterVendor] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [page, setPage] = useState(1);

  // New medicine dialog
  const [newMedOpen, setNewMedOpen] = useState(false);
  const [newMedForm, setNewMedForm] = useState(emptyNewMed);
  const [newMedLineIdx, setNewMedLineIdx] = useState(-1);

  // Searchable dropdown state
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorDropOpen, setVendorDropOpen] = useState(false);
  const [medSearches, setMedSearches] = useState<string[]>(['']);
  const [medDropOpen, setMedDropOpen] = useState<boolean[]>([false]);

  const updateMedSearch = (idx: number, val: string) => {
    const a = [...medSearches]; a[idx] = val; setMedSearches(a);
  };
  const updateMedDrop = (idx: number, val: boolean) => {
    const a = [...medDropOpen]; a[idx] = val; setMedDropOpen(a);
  };

  const getLineAmount = (item: LineItem) => item.quantity * item.rate;

  const grossTotal = items.reduce((s, i) => s + getLineAmount(i), 0);
  const totalGst = items.reduce((s, i) => {
    const med = medicines.find(m => m.id === i.medicineId);
    return s + (getLineAmount(i) * (med?.gstPercent || 0) / 100);
  }, 0);
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const netPayable = grossTotal - discount + totalGst;

  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems(prev => [...prev, emptyItem()]);
    setMedSearches(prev => [...prev, '']);
    setMedDropOpen(prev => [...prev, false]);
  };
  const removeItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
      setMedSearches(prev => prev.filter((_, i) => i !== idx));
      setMedDropOpen(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const resetForm = () => {
    setVendorId(''); setInvoiceNumber(''); setPurchaseDate(new Date().toISOString().split('T')[0]);
    setItems([emptyItem()]); setDiscount(0); setNotes(''); setPaymentMode('cash');
    setVendorSearch(''); setVendorDropOpen(false); setMedSearches(['']); setMedDropOpen([false]);
  };

  const handleAdd = () => {
    if (!vendorId || !invoiceNumber) { toast({ title: "Error", description: "Vendor and Invoice Number are required", variant: "destructive" }); return; }
    if (items.some(i => !i.medicineId || i.quantity <= 0 || i.rate <= 0)) { toast({ title: "Error", description: "All items need medicine, quantity, and rate", variant: "destructive" }); return; }

    const vendor = vendors.find(v => v.id === vendorId)!;
    const purchaseItems: PurchaseItem[] = items.map(item => {
      const med = medicines.find(m => m.id === item.medicineId)!;
      return {
        id: crypto.randomUUID(), medicineId: item.medicineId, medicineName: med.name,
        hsnCode: med.hsnCode, pack: med.pack, batch: item.batch, quantity: item.quantity,
        freeQty: item.freeQty, expiryDate: item.expiryDate, mrp: item.mrp, rate: item.rate,
        gstPercent: med.gstPercent, amount: item.quantity * item.rate,
      };
    });

    addPurchase({
      id: crypto.randomUUID(), invoiceNumber, vendorId, vendorName: vendor.name,
      purchaseDate, items: purchaseItems, grossTotal, discount, cgst, sgst, netPayable, notes,
      paymentMode,
      payments: paymentMode === 'cash' ? [] : [],
      paidAmount: paymentMode === 'cash' ? netPayable : 0,
    });

    resetForm();
    setAddOpen(false);
    toast({ title: "Success", description: "Purchase recorded successfully" });
  };

  const handleDelete = (id: string) => {
    deletePurchase(id);
    toast({ title: "Deleted", description: "Purchase removed" });
  };

  const openEdit = (purchase: typeof purchases[0]) => {
    setEditId(purchase.id);
    setVendorId(purchase.vendorId);
    setInvoiceNumber(purchase.invoiceNumber);
    setPurchaseDate(purchase.purchaseDate);
    setDiscount(purchase.discount);
    setNotes(purchase.notes || '');
    setPaymentMode(purchase.paymentMode);
    setItems(purchase.items.map(i => ({
      medicineId: i.medicineId,
      batch: i.batch,
      quantity: i.quantity,
      freeQty: i.freeQty,
      expiryDate: i.expiryDate,
      mrp: i.mrp,
      rate: i.rate,
    })));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!vendorId || !invoiceNumber) { toast({ title: "Error", description: "Vendor and Invoice Number are required", variant: "destructive" }); return; }
    if (items.some(i => !i.medicineId || i.quantity <= 0 || i.rate <= 0)) { toast({ title: "Error", description: "All items need medicine, quantity, and rate", variant: "destructive" }); return; }
    const vendor = vendors.find(v => v.id === vendorId)!;
    const purchaseItems = items.map(item => {
      const med = medicines.find(m => m.id === item.medicineId)!;
      return {
        id: crypto.randomUUID(), medicineId: item.medicineId, medicineName: med.name,
        hsnCode: med.hsnCode, pack: med.pack, batch: item.batch, quantity: item.quantity,
        freeQty: item.freeQty, expiryDate: item.expiryDate, mrp: item.mrp, rate: item.rate,
        gstPercent: med.gstPercent, amount: item.quantity * item.rate,
      };
    });
    updatePurchase(editId, {
      vendorId, vendorName: vendor.name, invoiceNumber, purchaseDate,
      items: purchaseItems, grossTotal, discount, cgst, sgst, netPayable, notes,
    });
    setEditOpen(false);
    resetForm();
    toast({ title: "Updated", description: "Purchase updated successfully" });
  };

  const handlePayment = () => {
    if (payAmount <= 0) { toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" }); return; }
    const purchase = purchases.find(p => p.id === payId);
    if (!purchase) return;
    const pending = purchase.netPayable - purchase.paidAmount;
    if (payAmount > pending) { toast({ title: "Error", description: `Amount exceeds pending ₹${pending.toLocaleString()}`, variant: "destructive" }); return; }
    addPurchasePayment(payId, { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], amount: payAmount, notes: payNotes });
    setPayOpen(false); setPayAmount(0); setPayNotes('');
    toast({ title: "Payment Recorded", description: `₹${payAmount.toLocaleString()} paid successfully` });
  };

  const handleCreateMedicine = () => {
    if (!newMedForm.name) { toast({ title: "Error", description: "Medicine name is required", variant: "destructive" }); return; }
    const newId = crypto.randomUUID();
    addMedicine({
      id: newId, name: newMedForm.name, hsnCode: newMedForm.hsnCode, pack: newMedForm.pack,
      category: newMedForm.category, manufacturer: newMedForm.manufacturer,
      currentStock: 0, reorderLevel: 20, avgPurchasePrice: 0,
      sellingPrice: newMedForm.sellingPrice, gstPercent: newMedForm.gstPercent,
    });
    if (newMedLineIdx >= 0) updateItem(newMedLineIdx, 'medicineId', newId);
    setNewMedOpen(false); setNewMedForm(emptyNewMed); setNewMedLineIdx(-1);
    toast({ title: "Success", description: `${newMedForm.name} added to medicines` });
  };

  // Filtering
  const filtered = purchases.filter(p => {
    if (search && !p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) && !p.vendorName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterVendor !== 'all' && p.vendorId !== filterVendor) return false;
    if (filterDateFrom && p.purchaseDate < filterDateFrom) return false;
    if (filterDateTo && p.purchaseDate > filterDateTo) return false;
    if (filterPayment !== 'all' && p.paymentMode !== filterPayment) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const viewPurchase = purchases.find(p => p.id === viewId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">Track all your medicine purchases from vendors</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setAddOpen(true); }}><Plus className="h-4 w-4" />Record Purchase</Button>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search invoice/vendor..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={filterVendor} onValueChange={v => { setFilterVendor(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="All Vendors" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" placeholder="From" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }} />
            <Input type="date" placeholder="To" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1); }} />
            <Select value={filterPayment} onValueChange={v => { setFilterPayment(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="All Modes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add Purchase Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record New Purchase</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    className="pl-9"
                    placeholder="Search vendor..."
                    value={vendorId ? (vendors.find(v => v.id === vendorId)?.name || vendorSearch) : vendorSearch}
                    onChange={e => { setVendorSearch(e.target.value); setVendorId(''); setVendorDropOpen(true); }}
                    onFocus={() => setVendorDropOpen(true)}
                    onBlur={() => setTimeout(() => setVendorDropOpen(false), 150)}
                  />
                  {vendorDropOpen && !vendorId && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                      {vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).length === 0
                        ? <div className="px-3 py-2 text-sm text-muted-foreground">No vendors found</div>
                        : vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).map(v => (
                          <div key={v.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                            onMouseDown={() => { setVendorId(v.id); setVendorSearch(v.name); setVendorDropOpen(false); }}>
                            <span className="font-medium">{v.name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{v.contactPerson}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2"><Label>Invoice Number</Label><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g. GST0154" /></div>
              <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} /></div>
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <RadioGroup value={paymentMode} onValueChange={(v: 'cash' | 'credit') => setPaymentMode(v)} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cash" id="p-cash" />
                  <Label htmlFor="p-cash" className="flex items-center gap-1 cursor-pointer"><Banknote className="h-4 w-4" />Cash</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="credit" id="p-credit" />
                  <Label htmlFor="p-credit" className="flex items-center gap-1 cursor-pointer"><CreditCard className="h-4 w-4" />Credit</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Line Items</h4>
              <div className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 text-xs font-medium text-muted-foreground">
                <span>Medicine</span><span>Batch</span><span>Qty</span><span>Free</span><span>MRP ₹</span><span>Rate ₹</span><span>Amount ₹</span><span></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 items-center">
                  <div className="flex gap-1">
                    <div className="relative flex-1">
                      <Input
                        className="h-9 text-sm pl-2"
                        placeholder="Search medicine..."
                        value={item.medicineId ? (medicines.find(m => m.id === item.medicineId)?.name || medSearches[idx] || '') : (medSearches[idx] || '')}
                        onChange={e => { updateMedSearch(idx, e.target.value); updateItem(idx, 'medicineId', ''); updateMedDrop(idx, true); }}
                        onFocus={() => updateMedDrop(idx, true)}
                        onBlur={() => setTimeout(() => updateMedDrop(idx, false), 150)}
                      />
                      {medDropOpen[idx] && !item.medicineId && (
                        <div className="absolute z-50 mt-1 w-72 rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                          {medicines.filter(m => m.name.toLowerCase().includes((medSearches[idx] || '').toLowerCase())).length === 0
                            ? <div className="px-3 py-2 text-sm text-muted-foreground">No medicines found</div>
                            : medicines.filter(m => m.name.toLowerCase().includes((medSearches[idx] || '').toLowerCase())).map(m => (
                              <div key={m.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                                onMouseDown={() => { updateItem(idx, 'medicineId', m.id); updateMedSearch(idx, m.name); updateMedDrop(idx, false); }}>
                                <span className="font-medium">{m.name}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" title="New medicine" onClick={() => { setNewMedLineIdx(idx); setNewMedForm(emptyNewMed); setNewMedOpen(true); }}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <Input className="h-9 text-sm" value={item.batch} onChange={e => updateItem(idx, 'batch', e.target.value)} placeholder="Batch" />
                  <Input type="number" className="h-9 text-sm" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} placeholder="0" />
                  <Input type="number" className="h-9 text-sm" value={item.freeQty || ''} onChange={e => updateItem(idx, 'freeQty', Number(e.target.value))} placeholder="0" />
                  <Input type="number" className="h-9 text-sm" value={item.mrp || ''} onChange={e => updateItem(idx, 'mrp', Number(e.target.value))} placeholder="0" />
                  <Input type="number" className="h-9 text-sm" value={item.rate || ''} onChange={e => updateItem(idx, 'rate', Number(e.target.value))} placeholder="0" />
                  <Input type="number" className="h-9 text-sm bg-muted" value={getLineAmount(item) || ''} disabled />
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeItem(idx)}><X className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1" onClick={addItem}><Plus className="h-3 w-3" />Add Item</Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Discount ₹</Label><Input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>CGST ₹</Label><Input type="number" value={cgst.toFixed(2)} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>SGST ₹</Label><Input type="number" value={sgst.toFixed(2)} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Net Payable ₹</Label><Input type="number" value={netPayable.toFixed(2)} disabled className="bg-muted font-bold" /></div>
            </div>
            <div className="space-y-2"><Label>Notes (Optional)</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any notes..." /></div>
            <Button onClick={handleAdd} className="w-full">Record Purchase</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Purchase Dialog */}
      <Dialog open={editOpen} onOpenChange={v => { setEditOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Purchase</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    className="pl-9"
                    placeholder="Search vendor..."
                    value={vendorId ? (vendors.find(v => v.id === vendorId)?.name || vendorSearch) : vendorSearch}
                    onChange={e => { setVendorSearch(e.target.value); setVendorId(''); setVendorDropOpen(true); }}
                    onFocus={() => setVendorDropOpen(true)}
                    onBlur={() => setTimeout(() => setVendorDropOpen(false), 150)}
                  />
                  {vendorDropOpen && !vendorId && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                      {vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).map(v => (
                        <div key={v.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                          onMouseDown={() => { setVendorId(v.id); setVendorSearch(v.name); setVendorDropOpen(false); }}>
                          <span className="font-medium">{v.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2"><Label>Invoice Number</Label><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g. GST0154" /></div>
              <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <RadioGroup value={paymentMode} onValueChange={(v: 'cash' | 'credit') => setPaymentMode(v)} className="flex gap-4">
                <div className="flex items-center gap-2"><RadioGroupItem value="cash" id="ep-cash" /><Label htmlFor="ep-cash" className="flex items-center gap-1 cursor-pointer"><Banknote className="h-4 w-4" />Cash</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="credit" id="ep-credit" /><Label htmlFor="ep-credit" className="flex items-center gap-1 cursor-pointer"><CreditCard className="h-4 w-4" />Credit</Label></div>
              </RadioGroup>
            </div>
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Line Items</h4>
              <div className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 text-xs font-medium text-muted-foreground">
                <span>Medicine</span><span>Batch</span><span>Qty</span><span>Free</span><span>Expiry</span><span>MRP ₹</span><span>Rate ₹</span><span></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 items-center">
                  <div className="relative">
                    <Input
                      className="h-9 text-sm pl-2"
                      placeholder="Search medicine..."
                      value={item.medicineId ? (medicines.find(m => m.id === item.medicineId)?.name || medSearches[idx] || '') : (medSearches[idx] || '')}
                      onChange={e => { updateMedSearch(idx, e.target.value); updateItem(idx, 'medicineId', ''); updateMedDrop(idx, true); }}
                      onFocus={() => updateMedDrop(idx, true)}
                      onBlur={() => setTimeout(() => updateMedDrop(idx, false), 150)}
                    />
                    {medDropOpen[idx] && !item.medicineId && (
                      <div className="absolute z-50 mt-1 w-72 rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                        {medicines.filter(m => m.name.toLowerCase().includes((medSearches[idx] || '').toLowerCase())).map(m => (
                          <div key={m.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                            onMouseDown={() => { updateItem(idx, 'medicineId', m.id); updateMedSearch(idx, m.name); updateMedDrop(idx, false); }}>
                            <span className="font-medium">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input className="h-9 text-sm" value={item.batch} onChange={e => updateItem(idx, 'batch', e.target.value)} placeholder="Batch" />
                  <Input type="number" className="h-9 text-sm" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} placeholder="0" />
                  <Input type="number" className="h-9 text-sm" value={item.freeQty || ''} onChange={e => updateItem(idx, 'freeQty', Number(e.target.value))} placeholder="0" />
                  <Input type="date" className="h-9 text-sm" value={item.expiryDate} onChange={e => updateItem(idx, 'expiryDate', e.target.value)} />
                  <Input type="number" className="h-9 text-sm" value={item.mrp || ''} onChange={e => updateItem(idx, 'mrp', Number(e.target.value))} placeholder="0" />
                  <Input type="number" className="h-9 text-sm" value={item.rate || ''} onChange={e => updateItem(idx, 'rate', Number(e.target.value))} placeholder="0" />
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeItem(idx)}><X className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1" onClick={addItem}><Plus className="h-3 w-3" />Add Item</Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Discount ₹</Label><Input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>CGST ₹</Label><Input value={cgst.toFixed(2)} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>SGST ₹</Label><Input value={sgst.toFixed(2)} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Net Payable ₹</Label><Input value={netPayable.toFixed(2)} disabled className="bg-muted font-bold" /></div>
            </div>
            <div className="space-y-2"><Label>Notes (Optional)</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any notes..." /></div>
            <Button onClick={handleEdit} className="w-full">Update Purchase</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Medicine Dialog */}
      <Dialog open={newMedOpen} onOpenChange={setNewMedOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Medicine</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Medicine Name *</Label><Input value={newMedForm.name} onChange={e => setNewMedForm({ ...newMedForm, name: e.target.value })} placeholder="e.g. DOLO 650" /></div>
              <div className="space-y-2"><Label>HSN Code</Label><Input value={newMedForm.hsnCode} onChange={e => setNewMedForm({ ...newMedForm, hsnCode: e.target.value })} placeholder="e.g. 3004" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Pack</Label><Input value={newMedForm.pack} onChange={e => setNewMedForm({ ...newMedForm, pack: e.target.value })} placeholder="e.g. 10S" /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={newMedForm.category} onChange={e => setNewMedForm({ ...newMedForm, category: e.target.value })} placeholder="e.g. Antibiotics" /></div>
              <div className="space-y-2"><Label>Manufacturer</Label><Input value={newMedForm.manufacturer} onChange={e => setNewMedForm({ ...newMedForm, manufacturer: e.target.value })} placeholder="e.g. Cipla" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Selling Price ₹</Label><Input type="number" value={newMedForm.sellingPrice || ''} onChange={e => setNewMedForm({ ...newMedForm, sellingPrice: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>GST %</Label><Input type="number" value={newMedForm.gstPercent || ''} onChange={e => setNewMedForm({ ...newMedForm, gstPercent: Number(e.target.value) })} /></div>
            </div>
            <Button onClick={handleCreateMedicine} className="w-full">Create Medicine & Select</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Purchase Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewPurchase && (
            <>
              <DialogHeader><DialogTitle>Purchase Bill - {viewPurchase.invoiceNumber}</DialogTitle></DialogHeader>
              <div className="space-y-4 rounded-lg border p-6">
                <div className="flex justify-between border-b pb-4">
                  <div><h3 className="text-lg font-bold">{viewPurchase.vendorName}</h3><p className="text-sm text-muted-foreground">Tax Invoice</p></div>
                  <div className="text-right">
                    <p className="font-medium">{viewPurchase.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{new Date(viewPurchase.purchaseDate).toLocaleDateString('en-IN')}</p>
                    <Badge variant={viewPurchase.paymentMode === 'cash' ? 'secondary' : 'outline'} className="mt-1">
                      {viewPurchase.paymentMode === 'cash' ? <><Banknote className="h-3 w-3 mr-1" />Cash</> : <><CreditCard className="h-3 w-3 mr-1" />Credit</>}
                    </Badge>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sl.</TableHead><TableHead>Description</TableHead><TableHead>HSN</TableHead><TableHead>Pack</TableHead>
                      <TableHead>Batch</TableHead><TableHead>Qty</TableHead><TableHead>Expiry</TableHead><TableHead>MRP</TableHead><TableHead>Rate</TableHead><TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewPurchase.items.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{item.medicineName}</TableCell>
                        <TableCell className="font-mono text-xs">{item.hsnCode}</TableCell>
                        <TableCell>{item.pack}</TableCell>
                        <TableCell>{item.batch}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : '-'}</TableCell>
                        <TableCell>₹{item.mrp}</TableCell>
                        <TableCell>₹{item.rate}</TableCell>
                        <TableCell>₹{item.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end border-t pt-4">
                  <div className="space-y-1 text-right text-sm w-64">
                    <div className="flex justify-between"><span className="text-muted-foreground">Gross Total:</span><span>₹{viewPurchase.grossTotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Discount:</span><span>₹{viewPurchase.discount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">CGST:</span><span>₹{viewPurchase.cgst}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">SGST:</span><span>₹{viewPurchase.sgst}</span></div>
                    <div className="flex justify-between border-t pt-1 font-bold text-base"><span>Net Payable:</span><span>₹{viewPurchase.netPayable.toLocaleString()}</span></div>
                  </div>
                </div>
                {/* Payment Tracking for Credit */}
                {viewPurchase.paymentMode === 'credit' && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold flex items-center gap-2"><IndianRupee className="h-4 w-4" />Payment History</h4>
                    <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-3">
                      <div><p className="text-xs text-muted-foreground">Total Bill</p><p className="font-bold">₹{viewPurchase.netPayable.toLocaleString()}</p></div>
                      <div><p className="text-xs text-muted-foreground">Paid Amount</p><p className="font-bold text-success">₹{viewPurchase.paidAmount.toLocaleString()}</p></div>
                      <div><p className="text-xs text-muted-foreground">Pending</p><p className="font-bold text-destructive">₹{(viewPurchase.netPayable - viewPurchase.paidAmount).toLocaleString()}</p></div>
                    </div>
                    {viewPurchase.payments.length > 0 && (
                      <Table>
                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {viewPurchase.payments.map(pay => (
                            <TableRow key={pay.id}>
                              <TableCell>{new Date(pay.date).toLocaleDateString('en-IN')}</TableCell>
                              <TableCell className="text-success font-medium">₹{pay.amount.toLocaleString()}</TableCell>
                              <TableCell className="text-muted-foreground">{pay.notes || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {viewPurchase.paidAmount < viewPurchase.netPayable && (
                      <Button variant="outline" size="sm" onClick={() => { setPayId(viewPurchase.id); setPayAmount(0); setPayNotes(''); setPayOpen(true); }}>
                        <IndianRupee className="h-3 w-3 mr-1" />Record Payment
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Amount ₹</Label><Input type="number" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} placeholder="Enter amount" /></div>
            <div className="space-y-2"><Label>Notes</Label><Input value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="e.g. Week 2 payment" /></div>
            <Button onClick={handlePayment} className="w-full">Record Payment</Button>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Purchases ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead><TableHead>Vendor</TableHead><TableHead>Date</TableHead>
                  <TableHead>Items</TableHead><TableHead>Net Payable</TableHead><TableHead>Mode</TableHead>
                  <TableHead>Paid</TableHead><TableHead>Pending</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(p => {
                  const pending = p.netPayable - p.paidAmount;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">{p.vendorName}</TableCell>
                      <TableCell>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{p.items.length} items</TableCell>
                      <TableCell><Badge variant="secondary">₹{p.netPayable.toLocaleString()}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={p.paymentMode === 'cash' ? 'secondary' : 'outline'}>
                          {p.paymentMode === 'cash' ? 'Cash' : 'Credit'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-success font-medium">₹{p.paidAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        {pending > 0 ? (
                          <Badge variant="destructive">₹{pending.toLocaleString()}</Badge>
                        ) : (
                          <Badge className="bg-success text-success-foreground">Paid</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setViewId(p.id); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                          {p.paymentMode === 'credit' && pending > 0 && (
                            <Button variant="ghost" size="icon" onClick={() => { setPayId(p.id); setPayAmount(0); setPayNotes(''); setPayOpen(true); }}><IndianRupee className="h-4 w-4 text-success" /></Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginated.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No purchases found</TableCell></TableRow>}
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
