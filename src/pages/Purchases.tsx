import { useState } from "react";
import { Plus, Edit, Trash2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockPurchases, mockCompanies, mockMedicines } from "@/lib/mockData";
import { Purchase } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Purchases() {
  const [purchases] = useState<Purchase[]>(mockPurchases);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const { toast } = useToast();

  const handleAdd = () => {
    toast({ title: "Success", description: "Purchase recorded successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">Track all your medicine purchases from companies</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Record Purchase</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Record New Purchase</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {mockCompanies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Invoice Number</Label><Input placeholder="e.g. GST0154" /></div>
              </div>
              <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" /></div>

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
                        {mockMedicines.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
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
              <div className="space-y-2"><Label>Upload Receipt (Optional)</Label><Input type="file" accept=".pdf,.jpg,.jpeg,.png" /></div>
              <div className="space-y-2"><Label>Notes (Optional)</Label><Input placeholder="Add any notes..." /></div>
              <Button onClick={handleAdd} className="w-full">Record Purchase</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle>All Purchases ({purchases.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Gross Total</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Net Payable</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-mono text-sm">{purchase.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{purchase.companyName}</TableCell>
                    <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{purchase.items.length} items</TableCell>
                    <TableCell>₹{purchase.grossTotal.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">₹{(purchase.cgst + purchase.sgst).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary">₹{purchase.netPayable.toLocaleString()}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedPurchase(purchase)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Purchase Bill - {purchase.invoiceNumber}</DialogTitle></DialogHeader>
                            <div className="space-y-4 rounded-lg border p-6">
                              <div className="flex justify-between border-b pb-4">
                                <div>
                                  <h3 className="text-lg font-bold">{purchase.companyName}</h3>
                                  <p className="text-sm text-muted-foreground">Tax Invoice</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{purchase.invoiceNumber}</p>
                                  <p className="text-sm text-muted-foreground">{new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}</p>
                                </div>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Sl.</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>HSN</TableHead>
                                    <TableHead>Pack</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Expiry</TableHead>
                                    <TableHead>MRP</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {purchase.items.map((item, idx) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{idx + 1}</TableCell>
                                      <TableCell className="font-medium">{item.medicineName}</TableCell>
                                      <TableCell className="font-mono text-xs">{item.hsnCode}</TableCell>
                                      <TableCell>{item.pack}</TableCell>
                                      <TableCell>{item.batch}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</TableCell>
                                      <TableCell>₹{item.mrp}</TableCell>
                                      <TableCell>₹{item.rate}</TableCell>
                                      <TableCell>₹{item.amount}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              <div className="flex justify-end border-t pt-4">
                                <div className="space-y-1 text-right text-sm">
                                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">Gross Total:</span><span>₹{purchase.grossTotal.toLocaleString()}</span></div>
                                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">Discount:</span><span>₹{purchase.discount}</span></div>
                                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">CGST:</span><span>₹{purchase.cgst}</span></div>
                                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">SGST:</span><span>₹{purchase.sgst}</span></div>
                                  <div className="flex justify-between gap-8 border-t pt-1 font-bold text-base"><span>Net Payable:</span><span>₹{purchase.netPayable.toLocaleString()}</span></div>
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
