import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function RecentTransactions() {
  const { purchases, sales } = useStore();
  
  const transactions = [
    ...purchases.map(p => ({ id: p.id, type: 'purchase' as const, party: p.vendorName, invoiceNumber: p.invoiceNumber, amount: p.netPayable, date: p.purchaseDate, itemCount: p.items.length })),
    ...sales.map(s => ({ id: s.id, type: 'sale' as const, party: s.shopName, invoiceNumber: s.invoiceNumber, amount: s.netPayable, date: s.saleDate, itemCount: s.items.length })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Badge variant={t.type === 'purchase' ? 'secondary' : 'default'}
                      className={`gap-1 ${t.type === 'sale' ? 'bg-success text-success-foreground' : ''}`}>
                      {t.type === 'purchase' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {t.type === 'purchase' ? 'Purchase' : 'Sale'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{t.invoiceNumber}</TableCell>
                  <TableCell className="font-medium">{t.party}</TableCell>
                  <TableCell>{t.itemCount} items</TableCell>
                  <TableCell className={t.type === 'purchase' ? 'text-destructive' : 'text-success'}>₹{t.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(t.date).toLocaleDateString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
