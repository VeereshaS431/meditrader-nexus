import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockTransactions } from "@/lib/mockData";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function RecentTransactions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Badge variant={transaction.type === 'purchase' ? 'secondary' : 'default'} className="gap-1">
                      {transaction.type === 'purchase' ? (
                        <ArrowDownLeft className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {transaction.type === 'purchase' ? 'Purchase' : 'Sale'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.party}</TableCell>
                  <TableCell>{transaction.quantity.toLocaleString()}</TableCell>
                  <TableCell className={transaction.type === 'purchase' ? 'text-destructive' : 'text-success'}>
                    ${transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
