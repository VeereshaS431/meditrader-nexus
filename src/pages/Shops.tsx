import { useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockShops, mockSales } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Shops() {
  const [shops] = useState(mockShops);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const { toast } = useToast();

  const shopSales = selectedShop 
    ? mockSales.filter(s => s.shopId === selectedShop)
    : [];

  const handleAdd = () => {
    toast({
      title: "Success",
      description: "Medical shop added successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Shops</h1>
          <p className="text-muted-foreground">Manage your client medical shops</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Shop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medical Shop</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input placeholder="Enter shop name" />
              </div>
              <div className="space-y-2">
                <Label>Owner Name</Label>
                <Input placeholder="Enter owner name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1-555-0123" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@shop.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Enter shop address" />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Shop</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shops Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>All Medical Shops ({shops.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.ownerName}</TableCell>
                    <TableCell>{shop.phone}</TableCell>
                    <TableCell>{shop.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-success-foreground">
                        ${shop.totalSales.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedShop(shop.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{shop.name} - Sales History</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Owner</p>
                                  <p className="font-medium">{shop.ownerName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Sales</p>
                                  <p className="font-medium">${shop.totalSales.toLocaleString()}</p>
                                </div>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Profit</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {shopSales.map((sale) => (
                                    <TableRow key={sale.id}>
                                      <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                                      <TableCell>{sale.quantity.toLocaleString()}</TableCell>
                                      <TableCell>${sale.totalAmount.toLocaleString()}</TableCell>
                                      <TableCell className="text-success">${sale.profit.toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
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
