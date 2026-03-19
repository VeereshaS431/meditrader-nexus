import { useState, useRef } from "react";
import { Plus, Trash2, Eye, Printer, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function Sales() {
  const { sales, shops, medicines, addSale, deleteSale } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewId, setViewId] = useState('');
  const [shopId, setShopId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const resetForm = () => {
    setShopId(''); setInvoiceNumber(`INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`);
    setSaleDate(new Date().toISOString().split('T')[0]); setItems([emptyItem()]); setDiscount(0);
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
    });

    resetForm();
    setAddOpen(false);
    toast({ title: "Success", description: "Sale recorded & invoice generated" });
  };

  const handleDelete = (id: string) => {
    deleteSale(id);
    toast({ title: "Deleted", description: "Sale removed" });
  };

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Invoice</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5;font-weight:600}.text-right{text-align:right}.font-bold{font-weight:700}.text-sm{font-size:12px}.border-t{border-top:2px solid #333}.mt-4{margin-top:16px}h3{margin:0}p{margin:4px 0}</style>
      </head><body>${content.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

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

      {/* Add Sale Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record New Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Medical Shop</Label>
                <Select value={shopId} onValueChange={setShopId}>
                  <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
                  <SelectContent>{shops.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Invoice Number</Label><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} /></div>
              <div className="space-y-2"><Label>Sale Date</Label><Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Line Items</h4>
              <div className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 text-xs font-medium text-muted-foreground">
                <span>Medicine</span><span>Batch</span><span>Qty</span><span>MRP ₹</span><span>Rate ₹</span><span>Amount ₹</span><span></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[2fr,1fr,0.7fr,0.7fr,0.7fr,0.7fr,0.3fr] gap-2 items-center">
                  <Select value={item.medicineId} onValueChange={v => updateItem(idx, 'medicineId', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{medicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name} (Stock: {m.currentStock})</SelectItem>)}</SelectContent>
                  </Select>
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
                {/* Invoice Header */}
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
                  </div>
                </div>
                {/* Buyer Info */}
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">M/S (Buyer)</p>
                  <p className="font-bold">{viewSale.shopName}</p>
                  {viewShop?.address && <p className="text-sm text-muted-foreground">{viewShop.address}</p>}
                  {viewShop?.gstNumber && <p className="text-xs text-muted-foreground">GSTIN: {viewShop.gstNumber}</p>}
                  {viewShop?.dlNumber && <p className="text-xs text-muted-foreground">D.L. No: {viewShop.dlNumber}</p>}
                </div>
                {/* Items Table */}
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
                {/* Tax Summary */}
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
                {/* Footer */}
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
            </>
          )}
        </DialogContent>
      </Dialog>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Sales ({sales.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead><TableHead>Shop</TableHead><TableHead>Date</TableHead>
                  <TableHead>Items</TableHead><TableHead>Gross Total</TableHead><TableHead>GST</TableHead>
                  <TableHead>Net Payable</TableHead><TableHead>Profit</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm">{sale.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{sale.shopName}</TableCell>
                    <TableCell>{new Date(sale.saleDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{sale.items.length} items</TableCell>
                    <TableCell>₹{sale.grossTotal.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">₹{(sale.cgst + sale.sgst).toLocaleString()}</TableCell>
                    <TableCell><Badge className="bg-success text-success-foreground">₹{sale.netPayable.toLocaleString()}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-success border-success">+₹{sale.profit.toLocaleString()}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setViewId(sale.id); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
