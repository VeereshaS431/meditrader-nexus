import { useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockCompanies, mockPurchases } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Companies() {
  const [companies] = useState(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const { toast } = useToast();

  const companyPurchases = selectedCompany 
    ? mockPurchases.filter(p => p.companyId === selectedCompany)
    : [];

  const handleAdd = () => {
    toast({
      title: "Success",
      description: "Company added successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">Manage your supplier companies</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input placeholder="Enter contact person name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1-555-0123" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@company.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Enter company address" />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Company</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Companies Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>All Companies ({companies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.contactPerson}</TableCell>
                    <TableCell>{company.phone}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        ${company.totalPurchases.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedCompany(company.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{company.name} - Purchase History</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Contact Person</p>
                                  <p className="font-medium">{company.contactPerson}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                                  <p className="font-medium">${company.totalPurchases.toLocaleString()}</p>
                                </div>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total Cost</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {companyPurchases.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                      <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                                      <TableCell>{purchase.quantity.toLocaleString()}</TableCell>
                                      <TableCell>${purchase.totalCost.toLocaleString()}</TableCell>
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
