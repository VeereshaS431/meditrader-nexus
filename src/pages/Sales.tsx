import { useState } from "react";
import { Plus, Edit, Trash2, FileText, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockSales, mockShops, mockMedicines } from "@/lib/mockData";
import { Sale } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Sales() {
  const [sales] = useState<Sale[]>(mockSales);
  const { toast } = useToast();

  const handleAdd = () => {
    toast({ title: "Success", description: "Sale recorded successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track all your medicine sales to medical shops</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Record Sale</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Record New Sale</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medical Shop</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
                    <SelectContent>
                      {mockShops.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Invoice Number</Label><Input placeholder="Auto-generated" /></div>
              </div>
              <div className="space-y-2"><Label>Sale Date</Label><Input type="date" /></div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Line Items</h4>
                <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground">
                  <span className="col-span-2">Medicine</span><span>Batch</span><span>Qty</span><span>Rate ₹</span><span>Amount ₹</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  <div className="col-span-2">
                    <Select>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select medicine" /></SelectTrigger>
                      <SelectContent>
                        {mockMedicines.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name} (Stock: {m.currentStock})</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input className="h-9 text-sm" placeholder="Batch" />
                  <Input type="number" className="h-9 text-sm" placeholder="Qty" />
                  <Input type="number" className="h-9 text-sm" placeholder="Rate" />
                  <Input type="number" className="h-9 text-sm" placeholder="Amount" disabled />
                </div>
                <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />Add Item</Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Discount ₹</Label><Input type="number" placeholder="0" /></div>
                <div className="space-y-2"><Label>CGST ₹</Label><Input type="number" placeholder="0" /></div>
                <div className="space-y-2"><Label>SGST ₹</Label><Input type="number" placeholder="0" /></div>
              </div>
              <Button onClick={handleAdd} className="w-full">Record Sale & Generate Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Sales ({sales.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Gross Total</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Net Payable</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
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
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <div className="flex items-center justify-between">
                                <DialogTitle>Tax Invoice - {sale.invoiceNumber}</DialogTitle>
                                <Button variant="outline" size="sm" className="gap-1"><Printer className="h-4 w-4" />Print</Button>
                              </div>
                            </DialogHeader>
                            <div className="space-y-4 rounded-lg border p-6" id="invoice-print">
                              {/* Invoice Header */}
                              <div className="flex justify-between border-b pb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-primary">MediTrade Manager</h3>
                                  <p className="text-sm text-muted-foreground">Medicine Distribution</p>
                                  <p className="text-xs text-muted-foreground mt-1">GST: 37XXXXXXXXX1ZX</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg">{sale.invoiceNumber}</p>
                                  <p className="text-sm text-muted-foreground">Date: {new Date(sale.saleDate).toLocaleDateString('en-IN')}</p>
                                </div>
                              </div>
                              {/* Buyer Info */}
                              <div className="rounded-md bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">M/S</p>
                                <p className="font-bold">{sale.shopName}</p>
                                {mockShops.find(s => s.id === sale.shopId)?.gstNumber && (
                                  <p className="text-xs text-muted-foreground">GSTIN: {mockShops.find(s => s.id === sale.shopId)?.gstNumber}</p>
                                )}
                              </div>
                              {/* Items Table */}
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Sl.</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>HSN</TableHead>
                                    <TableHead>Pack</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>MRP</TableHead>
                                    <TableHead>GST%</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sale.items.map((item, idx) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{idx + 1}</TableCell>
                                      <TableCell className="font-medium">{item.medicineName}</TableCell>
                                      <TableCell className="font-mono text-xs">{item.hsnCode}</TableCell>
                                      <TableCell>{item.pack}</TableCell>
                                      <TableCell>{item.batch}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>₹{item.mrp}</TableCell>
                                      <TableCell>{item.gstPercent}%</TableCell>
                                      <TableCell>₹{item.rate}</TableCell>
                                      <TableCell>₹{item.amount}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {/* Tax Summary */}
                              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div className="text-sm space-y-1">
                                  <p><span className="text-muted-foreground">No. of Items:</span> {sale.items.length}</p>
                                  <p><span className="text-muted-foreground">Total Qty:</span> {sale.items.reduce((s, i) => s + i.quantity, 0)}</p>
                                </div>
                                <div className="space-y-1 text-right text-sm">
                                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">Gross Total:</span><span>₹{sale.grossTotal.toLocaleString()}</span></div>
                                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">Discount:</span><span>₹{sale.discount}</span></div>
                                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">CGST:</span><span>₹{sale.cgst}</span></div>
                                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">SGST:</span><span>₹{sale.sgst}</span></div>
                                  <div className="flex justify-between gap-8 border-t pt-2 font-bold text-lg"><span>NET PAYABLE:</span><span>₹{sale.netPayable.toLocaleString()}</span></div>
                                </div>
                              </div>
                              {/* Footer */}
                              <div className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
                                <div>
                                  <p>1. Goods once sold will not be taken back / exchanged</p>
                                  <p>2. Bills not paid on due date will charged 24% interest</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-foreground text-sm">MediTrade Manager</p>
                                  <p className="mt-4">Authorized Signatory</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
