import { useState } from "react";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockSales, mockShops } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Sales() {
  const [sales] = useState(mockSales);
  const { toast } = useToast();

  const handleAdd = () => {
    toast({
      title: "Success",
      description: "Sale recorded successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track all your medicine sales</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Medical Shop</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockShops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price per Unit</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sale Date</Label>
                <Input type="date" />
              </div>
              <Button onClick={handleAdd} className="w-full">Record Sale</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>All Sales ({sales.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price/Unit</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm">{sale.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{sale.shopName}</TableCell>
                    <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.quantity.toLocaleString()}</TableCell>
                    <TableCell>${sale.pricePerUnit.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-success-foreground">
                        ${sale.totalAmount.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-success border-success">
                        +${sale.profit.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Invoice Preview - {sale.invoiceNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 rounded-lg border p-6">
                              <div className="flex justify-between border-b pb-4">
                                <div>
                                  <h3 className="text-lg font-bold">MediTrade Manager</h3>
                                  <p className="text-sm text-muted-foreground">Medicine Distribution</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{sale.invoiceNumber}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(sale.saleDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Sold To:</p>
                                <p className="font-medium">{sale.shopName}</p>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Medicine Units</TableCell>
                                    <TableCell>{sale.quantity.toLocaleString()}</TableCell>
                                    <TableCell>${sale.pricePerUnit.toFixed(2)}</TableCell>
                                    <TableCell>${sale.totalAmount.toLocaleString()}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                              <div className="flex justify-end border-t pt-4">
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">Total Amount</p>
                                  <p className="text-2xl font-bold">${sale.totalAmount.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
