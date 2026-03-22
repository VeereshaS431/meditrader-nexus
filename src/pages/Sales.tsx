import { useState, useRef } from "react";
import { Plus, Trash2, Eye, Printer, Download, X, Search, CreditCard, Banknote, IndianRupee, Edit } from "lucide-react";
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
import { SaleItem } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface LineItem {
  medicineId: string;
  batch: string;
  quantity: number;
  mrp: number;
  rate: number;
}

const emptyItem = (): LineItem => ({ medicineId: '', batch: '', quantity: 0, mrp: 0, rate: 0 });
const ITEMS_PER_PAGE = 10;
const emptyNewMed = { name: '', hsnCode: '', pack: '', category: '', manufacturer: '', gstPercent: 5, sellingPrice: 0 };

export default function Sales() {
  const { sales, shops, medicines, addSale, updateSale, deleteSale, addSalePayment, addMedicine } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payId, setPayId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payNotes, setPayNotes] = useState('');
  const [viewId, setViewId] = useState('');
  const [shopId, setShopId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'credit'>('cash');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Filters
  const [search, setSearch] = useState('');
  const [filterShop, setFilterShop] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [page, setPage] = useState(1);

  // New medicine
  const [newMedOpen, setNewMedOpen] = useState(false);
  const [newMedForm, setNewMedForm] = useState(emptyNewMed);
  const [newMedLineIdx, setNewMedLineIdx] = useState(-1);

  // Searchable dropdown state
  const [shopSearch, setShopSearch] = useState('');
  const [shopDropOpen, setShopDropOpen] = useState(false);
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
    setShopId(''); setInvoiceNumber(`INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`);
    setSaleDate(new Date().toISOString().split('T')[0]); setItems([emptyItem()]); setDiscount(0); setPaymentMode('cash');
    setShopSearch(''); setShopDropOpen(false); setMedSearches(['']); setMedDropOpen([false]);
  };

  const handleAdd = () => {
    if (!shopId || !invoiceNumber) { toast({ title: "Error", description: "Shop and Invoice Number are required", variant: "destructive" }); return; }
    if (items.some(i => !i.medicineId || i.quantity <= 0 || i.rate <= 0)) { toast({ title: "Error", description: "All items need medicine, quantity, and rate", variant: "destructive" }); return; }

    const shop = shops.find(s => s.id === shopId)!;
    const saleItems: SaleItem[] = items.map(item => {
      const med = medicines.find(m => m.id === item.medicineId)!;
      return {
        id: crypto.randomUUID(), medicineId: item.medicineId, medicineName: med.name,
        hsnCode: med.hsnCode, pack: med.pack, batch: item.batch, quantity: item.quantity,
        mrp: item.mrp, rate: item.rate, gstPercent: med.gstPercent, amount: item.quantity * item.rate,
      };
    });

    const profit = saleItems.reduce((s, si) => {
      const med = medicines.find(m => m.id === si.medicineId);
      return s + (si.rate - (med?.avgPurchasePrice || 0)) * si.quantity;
    }, 0);

    addSale({
      id: crypto.randomUUID(), invoiceNumber, shopId, shopName: shop.name,
      saleDate, items: saleItems, grossTotal, discount, cgst, sgst, netPayable, profit,
      paymentMode,
      payments: [],
      paidAmount: paymentMode === 'cash' ? netPayable : 0,
    });

    resetForm();
    setAddOpen(false);
    toast({ title: "Success", description: "Sale recorded & invoice generated" });
  };

  const handleDelete = (id: string) => {
    deleteSale(id);
    toast({ title: "Deleted", description: "Sale removed" });
  };

  const openEdit = (sale: typeof sales[0]) => {
    setEditId(sale.id);
    setShopId(sale.shopId);
    setInvoiceNumber(sale.invoiceNumber);
    setSaleDate(sale.saleDate);
    setDiscount(sale.discount);
    setPaymentMode(sale.paymentMode);
    setItems(sale.items.map(i => ({ medicineId: i.medicineId, batch: i.batch, quantity: i.quantity, mrp: i.mrp, rate: i.rate })));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!shopId || !invoiceNumber) { toast({ title: "Error", description: "Shop and Invoice Number are required", variant: "destructive" }); return; }
    if (items.some(i => !i.medicineId || i.quantity <= 0 || i.rate <= 0)) { toast({ title: "Error", description: "All items need medicine, quantity, and rate", variant: "destructive" }); return; }
    const shop = shops.find(s => s.id === shopId)!;
    const saleItems: SaleItem[] = items.map(item => {
      const med = medicines.find(m => m.id === item.medicineId)!;
      return { id: crypto.randomUUID(), medicineId: item.medicineId, medicineName: med.name, hsnCode: med.hsnCode, pack: med.pack, batch: item.batch, quantity: item.quantity, mrp: item.mrp, rate: item.rate, gstPercent: med.gstPercent, amount: item.quantity * item.rate };
    });
    const profit = saleItems.reduce((s, si) => { const med = medicines.find(m => m.id === si.medicineId); return s + (si.rate - (med?.avgPurchasePrice || 0)) * si.quantity; }, 0);
    updateSale(editId, { shopId, shopName: shop.name, invoiceNumber, saleDate, items: saleItems, grossTotal, discount, cgst, sgst, netPayable, profit });
    setEditOpen(false); resetForm();
    toast({ title: "Updated", description: "Sale updated successfully" });
  };

  const handlePayment = () => {
    if (payAmount <= 0) { toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" }); return; }
    const sale = sales.find(s => s.id === payId);
    if (!sale) return;
    const pending = sale.netPayable - sale.paidAmount;
    if (payAmount > pending) { toast({ title: "Error", description: `Amount exceeds pending ₹${pending.toLocaleString()}`, variant: "destructive" }); return; }
    addSalePayment(payId, { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], amount: payAmount, notes: payNotes });
    setPayOpen(false); setPayAmount(0); setPayNotes('');
    toast({ title: "Payment Recorded", description: `₹${payAmount.toLocaleString()} received successfully` });
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

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Invoice</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5;font-weight:600}.text-right{text-align:right}.font-bold{font-weight:700}.text-sm{font-size:12px}</style></head><body>${content.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  // Filtering
  const filtered = sales.filter(s => {
    if (search && !s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) && !s.shopName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterShop !== 'all' && s.shopId !== filterShop) return false;
    if (filterDateFrom && s.saleDate < filterDateFrom) return false;
    if (filterDateTo && s.saleDate > filterDateTo) return false;
    if (filterPayment !== 'all' && s.paymentMode !== filterPayment) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const viewSale = sales.find(s => s.id === viewId);
  const viewShop = viewSale ? shops.find(s => s.id === viewSale.shopId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track all your medicine sales to medical shops</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setAddOpen(true); }}><Plus className="h-4 w-4" />Record Sale</Button>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search invoice/shop..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={filterShop} onValueChange={v => { setFilterShop(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="All Shops" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shops</SelectItem>
                {shops.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }} />
            <Input type="date" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1); }} />
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

      {/* Add Sale Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record New Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Medical Shop</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    className="pl-9"
                    placeholder="Search shop..."
                    value={shopId ? (shops.find(s => s.id === shopId)?.name || shopSearch) : shopSearch}
                    onChange={e => { setShopSearch(e.target.value); setShopId(''); setShopDropOpen(true); }}
                    onFocus={() => setShopDropOpen(true)}
                    onBlur={() => setTimeout(() => setShopDropOpen(false), 150)}
                  />
                  {shopDropOpen && !shopId && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                      {shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase())).length === 0
                        ? <div className="px-3 py-2 text-sm text-muted-foreground">No shops found</div>
                        : shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase())).map(s => (
                          <div key={s.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                            onMouseDown={() => { setShopId(s.id); setShopSearch(s.name); setShopDropOpen(false); }}>
                            <span className="font-medium">{s.name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{s.ownerName}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2"><Label>Invoice Number</Label><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} /></div>
              <div className="space-y-2"><Label>Sale Date</Label><Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></div>
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <RadioGroup value={paymentMode} onValueChange={(v: 'cash' | 'credit') => setPaymentMode(v)} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cash" id="s-cash" />
                  <Label htmlFor="s-cash" className="flex items-center gap-1 cursor-pointer"><Banknote className="h-4 w-4" />Cash</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="credit" id="s-credit" />
                  <Label htmlFor="s-credit" className="flex items-center gap-1 cursor-pointer"><CreditCard className="h-4 w-4" />Credit</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Line Items</h4>
              <div className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 text-xs font-medium text-muted-foreground">
                <span>Medicine</span><span>Batch</span><span>Qty</span><span>MRP ₹</span><span>Rate ₹</span><span>Amount ₹</span><span></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 items-center">
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
                                <span className="text-muted-foreground ml-2 text-xs">Stock: {m.currentStock}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" title="New medicine" onClick={() => { setNewMedLineIdx(idx); setNewMedForm(emptyNewMed); setNewMedOpen(true); }}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <Input className="h-9 text-sm" value={item.batch} onChange={e => updateItem(idx, 'batch', e.target.value)} placeholder="Batch" />
                  <Input type="number" className="h-9 text-sm" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} placeholder="0" />
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
              <div className="space-y-2"><Label>CGST ₹</Label><Input value={cgst.toFixed(2)} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>SGST ₹</Label><Input value={sgst.toFixed(2)} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Net Payable ₹</Label><Input value={netPayable.toFixed(2)} disabled className="bg-muted font-bold" /></div>
            </div>
            <Button onClick={handleAdd} className="w-full">Record Sale & Generate Invoice</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog open={editOpen} onOpenChange={v => { setEditOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Medical Shop</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    className="pl-9"
                    placeholder="Search shop..."
                    value={shopId ? (shops.find(s => s.id === shopId)?.name || shopSearch) : shopSearch}
                    onChange={e => { setShopSearch(e.target.value); setShopId(''); setShopDropOpen(true); }}
                    onFocus={() => setShopDropOpen(true)}
                    onBlur={() => setTimeout(() => setShopDropOpen(false), 150)}
                  />
                  {shopDropOpen && !shopId && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                      {shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase())).map(s => (
                        <div key={s.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                          onMouseDown={() => { setShopId(s.id); setShopSearch(s.name); setShopDropOpen(false); }}>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2"><Label>Invoice Number</Label><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} /></div>
              <div className="space-y-2"><Label>Sale Date</Label><Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <RadioGroup value={paymentMode} onValueChange={(v: 'cash' | 'credit') => setPaymentMode(v)} className="flex gap-4">
                <div className="flex items-center gap-2"><RadioGroupItem value="cash" id="e-cash" /><Label htmlFor="e-cash" className="flex items-center gap-1 cursor-pointer"><Banknote className="h-4 w-4" />Cash</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="credit" id="e-credit" /><Label htmlFor="e-credit" className="flex items-center gap-1 cursor-pointer"><CreditCard className="h-4 w-4" />Credit</Label></div>
              </RadioGroup>
            </div>
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Line Items</h4>
              <div className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 text-xs font-medium text-muted-foreground">
                <span>Medicine</span><span>Batch</span><span>Qty</span><span>MRP ₹</span><span>Rate ₹</span><span>Amount ₹</span><span></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 items-center">
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
                            <span className="text-muted-foreground ml-2 text-xs">Stock: {m.currentStock}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input className="h-9 text-sm" value={item.batch} onChange={e => updateItem(idx, 'batch', e.target.value)} placeholder="Batch" />
                  <Input type="number" className="h-9 text-sm" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} placeholder="0" />
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
              <div className="space-y-2"><Label>CGST ₹</Label><Input value={cgst.toFixed(2)} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>SGST ₹</Label><Input value={sgst.toFixed(2)} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Net Payable ₹</Label><Input value={netPayable.toFixed(2)} disabled className="bg-muted font-bold" /></div>
            </div>
            <Button onClick={handleEdit} className="w-full">Update Sale</Button>
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

      {/* Invoice View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewSale && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Tax Invoice - {viewSale.invoiceNumber}</DialogTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}><Printer className="h-4 w-4" />Print</Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}><Download className="h-4 w-4" />Download</Button>
                  </div>
                </div>
              </DialogHeader>
              <div ref={invoiceRef} className="space-y-4 rounded-lg border p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'hsl(186 65% 45%)' }}>MediTrade Manager</h3>
                    <p className="text-sm text-muted-foreground">Medicine Distribution & Wholesale</p>
                    <p className="text-xs text-muted-foreground mt-1">GSTIN: 37XXXXXXXXX1ZX</p>
                    <p className="text-xs text-muted-foreground">D.L. No: WLF20B/2025/AP/XXXXXX</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{viewSale.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">Date: {new Date(viewSale.saleDate).toLocaleDateString('en-IN')}</p>
                    <p className="text-xs mt-1 font-medium">TAX INVOICE</p>
                    <Badge variant={viewSale.paymentMode === 'cash' ? 'secondary' : 'outline'} className="mt-1">
                      {viewSale.paymentMode === 'cash' ? 'Cash' : 'Credit'}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">M/S (Buyer)</p>
                  <p className="font-bold">{viewSale.shopName}</p>
                  {viewShop?.address && <p className="text-sm text-muted-foreground">{viewShop.address}</p>}
                  {viewShop?.gstNumber && <p className="text-xs text-muted-foreground">GSTIN: {viewShop.gstNumber}</p>}
                  {viewShop?.dlNumber && <p className="text-xs text-muted-foreground">D.L. No: {viewShop.dlNumber}</p>}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>Sl.</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>Description</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>HSN</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>Pack</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>Batch</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>Qty</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>MRP</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>GST%</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>Rate</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewSale.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px', fontWeight: '500' }}>{item.medicineName}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '11px', fontFamily: 'monospace' }}>{item.hsnCode}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>{item.pack}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>{item.batch}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>{item.quantity}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>₹{item.mrp}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>{item.gstPercent}%</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>₹{item.rate}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px', textAlign: 'right' }}>₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', paddingTop: '16px', marginTop: '16px' }}>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">No. of Items:</span> {viewSale.items.length}</p>
                    <p><span className="text-muted-foreground">Total Qty:</span> {viewSale.items.reduce((s, i) => s + i.quantity, 0)}</p>
                  </div>
                  <div style={{ width: '250px' }} className="space-y-1 text-right text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Gross Total:</span><span>₹{viewSale.grossTotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Discount:</span><span>₹{viewSale.discount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">CGST:</span><span>₹{viewSale.cgst}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">SGST:</span><span>₹{viewSale.sgst}</span></div>
                    <div className="flex justify-between border-t pt-2 font-bold text-lg"><span>NET PAYABLE:</span><span>₹{viewSale.netPayable.toLocaleString()}</span></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '16px', marginTop: '16px' }}>
                  <div className="text-xs text-muted-foreground">
                    <p>1. Goods once sold will not be taken back / exchanged</p>
                    <p>2. Bills not paid on due date will be charged 24% interest</p>
                    <p>3. Subject to local jurisdiction only</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">For MediTrade Manager</p>
                    <div className="mt-8 border-t border-dashed pt-1">
                      <p className="text-xs text-muted-foreground">Authorized Signatory</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Tracking for Credit */}
              {viewSale.paymentMode === 'credit' && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><IndianRupee className="h-4 w-4" />Payment History</h4>
                  <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-3">
                    <div><p className="text-xs text-muted-foreground">Total Bill</p><p className="font-bold">₹{viewSale.netPayable.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Received</p><p className="font-bold text-success">₹{viewSale.paidAmount.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Pending</p><p className="font-bold text-destructive">₹{(viewSale.netPayable - viewSale.paidAmount).toLocaleString()}</p></div>
                  </div>
                  {viewSale.payments.length > 0 && (
                    <Table>
                      <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {viewSale.payments.map(pay => (
                          <TableRow key={pay.id}>
                            <TableCell>{new Date(pay.date).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell className="text-success font-medium">₹{pay.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">{pay.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  {viewSale.paidAmount < viewSale.netPayable && (
                    <Button variant="outline" size="sm" onClick={() => { setPayId(viewSale.id); setPayAmount(0); setPayNotes(''); setPayOpen(true); }}>
                      <IndianRupee className="h-3 w-3 mr-1" />Record Payment
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Payment Received</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Amount ₹</Label><Input type="number" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} placeholder="Enter amount" /></div>
            <div className="space-y-2"><Label>Notes</Label><Input value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="e.g. Week 2 payment" /></div>
            <Button onClick={handlePayment} className="w-full">Record Payment</Button>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Sales ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead><TableHead>Shop</TableHead><TableHead>Date</TableHead>
                  <TableHead>Items</TableHead><TableHead>Net Payable</TableHead><TableHead>Mode</TableHead>
                  <TableHead>Received</TableHead><TableHead>Pending</TableHead><TableHead>Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(sale => {
                  const pending = sale.netPayable - sale.paidAmount;
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">{sale.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">{sale.shopName}</TableCell>
                      <TableCell>{new Date(sale.saleDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{sale.items.length} items</TableCell>
                      <TableCell><Badge variant="secondary">₹{sale.netPayable.toLocaleString()}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={sale.paymentMode === 'cash' ? 'secondary' : 'outline'}>
                          {sale.paymentMode === 'cash' ? 'Cash' : 'Credit'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-success font-medium">₹{sale.paidAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        {pending > 0 ? (
                          <Badge variant="destructive">₹{pending.toLocaleString()}</Badge>
                        ) : (
                          <Badge className="bg-success text-success-foreground">Paid</Badge>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-success border-success">+₹{sale.profit.toLocaleString()}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setViewId(sale.id); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(sale)}><Edit className="h-4 w-4" /></Button>
                          {sale.paymentMode === 'credit' && pending > 0 && (
                            <Button variant="ghost" size="icon" onClick={() => { setPayId(sale.id); setPayAmount(0); setPayNotes(''); setPayOpen(true); }}><IndianRupee className="h-4 w-4 text-success" /></Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginated.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No sales found</TableCell></TableRow>}
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
