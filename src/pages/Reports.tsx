import { useState } from "react";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { purchases, sales, vendors, shops } = useStore();
  const [dateFrom, setDateFrom] = useState("2025-12-01");
  const [dateTo, setDateTo] = useState("2025-12-31");
  const { toast } = useToast();

  const totalPurchases = purchases.reduce((sum, p) => sum + p.netPayable, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.netPayable, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);

  const handleDownload = (format: string) => {
    toast({ title: "Download Started", description: `Downloading report in ${format.toUpperCase()} format...` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Reports</h1><p className="text-muted-foreground">Generate comprehensive business reports</p></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Report Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2"><Label>Date From</Label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
              <div className="space-y-2"><Label>Date To</Label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Select><SelectTrigger><SelectValue placeholder="All Vendors" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Vendors</SelectItem>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Shop</Label>
                <Select><SelectTrigger><SelectValue placeholder="All Shops" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Shops</SelectItem>{shops.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Purchases', value: `₹${totalPurchases.toLocaleString()}`, color: 'text-destructive' },
          { label: 'Total Sales', value: `₹${totalSales.toLocaleString()}`, color: 'text-success' },
          { label: 'Net Profit', value: `₹${totalProfit.toLocaleString()}`, color: 'text-primary' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }}>
            <Card className="shadow-soft"><CardContent className="pt-6"><div className="text-center"><p className="text-sm font-medium text-muted-foreground">{item.label}</p><p className={`mt-2 text-3xl font-bold ${item.color}`}>{item.value}</p></div></CardContent></Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detailed Report</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload('pdf')}><Download className="h-4 w-4" />PDF</Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload('excel')}><Download className="h-4 w-4" />Excel</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold">Purchases Summary</h3>
                <Table>
                  <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Vendor</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead><TableHead className="text-right">Net Payable</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {purchases.map(p => (
                      <TableRow key={p.id}><TableCell className="font-mono text-sm">{p.invoiceNumber}</TableCell><TableCell className="font-medium">{p.vendorName}</TableCell><TableCell>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</TableCell><TableCell>{p.items.length} items</TableCell><TableCell className="text-right text-destructive">₹{p.netPayable.toLocaleString()}</TableCell></TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold"><TableCell colSpan={4}>Total Purchases</TableCell><TableCell className="text-right">₹{totalPurchases.toLocaleString()}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold">Sales Summary</h3>
                <Table>
                  <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Shop</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead><TableHead className="text-right">Net Payable</TableHead><TableHead className="text-right">Profit</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {sales.map(s => (
                      <TableRow key={s.id}><TableCell className="font-mono text-sm">{s.invoiceNumber}</TableCell><TableCell className="font-medium">{s.shopName}</TableCell><TableCell>{new Date(s.saleDate).toLocaleDateString('en-IN')}</TableCell><TableCell>{s.items.length} items</TableCell><TableCell className="text-right text-success">₹{s.netPayable.toLocaleString()}</TableCell><TableCell className="text-right text-primary">₹{s.profit.toLocaleString()}</TableCell></TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold"><TableCell colSpan={4}>Total Sales & Profit</TableCell><TableCell className="text-right">₹{totalSales.toLocaleString()}</TableCell><TableCell className="text-right">₹{totalProfit.toLocaleString()}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
