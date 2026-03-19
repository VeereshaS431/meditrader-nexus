import { useState } from "react";
import { Plus, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function Purchases() {
  const { purchases, vendors, medicines, addPurchase, deletePurchase } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewId, setViewId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const getLineAmount = (item: LineItem) => item.quantity * item.rate;

  const grossTotal = items.reduce((s, i) => s + getLineAmount(i), 0);
  const totalGst = items.reduce((s, i) => {
    const med = medicines.find(m => m.id === i.medicineId);
    const gstPct = med?.gstPercent || 0;
    return s + (getLineAmount(i) * gstPct / 100);
  }, 0);
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const netPayable = grossTotal - discount + totalGst;

  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const resetForm = () => {
    setVendorId(''); setInvoiceNumber(''); setPurchaseDate(new Date().toISOString().split('T')[0]);
    setItems([emptyItem()]); setDiscount(0); setNotes('');
  };

  const handleAdd = () => {
    if (!vendorId || !invoiceNumber) { toast({ title: "Error", description: "Vendor and Invoice Number are required", variant: "destructive" }); return; }
    if (items.some(i => !i.medicineId || i.quantity <= 0 || i.rate <= 0)) { toast({ title: "Error", description: "All items need medicine, quantity, and rate", variant: "destructive" }); return; }

    const vendor = vendors.find(v => v.id === vendorId)!;
    const purchaseItems: PurchaseItem[] = items.map((item, idx) => {
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
    });

    resetForm();
    setAddOpen(false);
    toast({ title: "Success", description: "Purchase recorded successfully" });
  };

  const handleDelete = (id: string) => {
    deletePurchase(id);
    toast({ title: "Deleted", description: "Purchase removed" });
  };

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

      {/* Add Purchase Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record New Purchase</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Invoice Number</Label><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g. GST0154" /></div>
              <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} /></div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Line Items</h4>
              <div className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 text-xs font-medium text-muted-foreground">
                <span>Medicine</span><span>Batch</span><span>Qty</span><span>Free</span><span>MRP ₹</span><span>Rate ₹</span><span>Amount ₹</span><span></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 items-center">
                  <Select value={item.medicineId} onValueChange={v => updateItem(idx, 'medicineId', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{medicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
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

      {/* View Purchase Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewPurchase && (
            <>
              <DialogHeader><DialogTitle>Purchase Bill - {viewPurchase.invoiceNumber}</DialogTitle></DialogHeader>
              <div className="space-y-4 rounded-lg border p-6">
                <div className="flex justify-between border-b pb-4">
                  <div><h3 className="text-lg font-bold">{viewPurchase.vendorName}</h3><p className="text-sm text-muted-foreground">Tax Invoice</p></div>
                  <div className="text-right"><p className="font-medium">{viewPurchase.invoiceNumber}</p><p className="text-sm text-muted-foreground">{new Date(viewPurchase.purchaseDate).toLocaleDateString('en-IN')}</p></div>
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Purchases ({purchases.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead><TableHead>Vendor</TableHead><TableHead>Date</TableHead>
                  <TableHead>Items</TableHead><TableHead>Gross Total</TableHead><TableHead>GST</TableHead>
                  <TableHead>Net Payable</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{p.vendorName}</TableCell>
                    <TableCell>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{p.items.length} items</TableCell>
                    <TableCell>₹{p.grossTotal.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">₹{(p.cgst + p.sgst).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary">₹{p.netPayable.toLocaleString()}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setViewId(p.id); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
