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
import { mockPurchases, mockCompanies } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Purchases() {
  const [purchases] = useState(mockPurchases);
  const { toast } = useToast();

  const handleAdd = () => {
    toast({
      title: "Success",
      description: "Purchase recorded successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">Track all your medicine purchases</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record Purchase
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Purchase</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
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
                  <Label>Price per Unit</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Upload Receipt (Optional)</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input placeholder="Add any notes..." />
              </div>
              <Button onClick={handleAdd} className="w-full">Record Purchase</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Purchases Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>All Purchases ({purchases.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price/Unit</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.companyName}</TableCell>
                    <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                    <TableCell>{purchase.quantity.toLocaleString()}</TableCell>
                    <TableCell>${purchase.pricePerUnit.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        ${purchase.totalCost.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {purchase.receiptUrl && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Receipt Preview</DialogTitle>
                            </DialogHeader>
                            <div className="flex h-96 items-center justify-center rounded-lg bg-muted">
                              <div className="text-center text-muted-foreground">
                                <FileText className="mx-auto h-16 w-16 mb-4" />
                                <p>Receipt file would be displayed here</p>
                                <p className="text-sm">{purchase.receiptUrl}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
