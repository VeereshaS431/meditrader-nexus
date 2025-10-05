import { useState } from "react";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockPurchases, mockSales, mockCompanies, mockShops } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("2024-03-01");
  const [dateTo, setDateTo] = useState("2024-03-31");
  const { toast } = useToast();

  const totalPurchases = mockPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalSales = mockSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfit = mockSales.reduce((sum, s) => sum + s.profit, 0);

  const handleDownload = (format: string) => {
    toast({
      title: "Download Started",
      description: `Downloading report in ${format.toUpperCase()} format...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate comprehensive business reports</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Date From</Label>
                <Input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date To</Label>
                <Input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Shop</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Shops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shops</SelectItem>
                    {mockShops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                <p className="mt-2 text-3xl font-bold text-destructive">
                  ${totalPurchases.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="mt-2 text-3xl font-bold text-success">
                  ${totalSales.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  ${totalProfit.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detailed Report</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleDownload('pdf')}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleDownload('excel')}
                >
                  <Download className="h-4 w-4" />
                  Download Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Purchases Section */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">Purchases Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.companyName}</TableCell>
                        <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell>{purchase.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-destructive">
                          ${purchase.totalCost.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold">
                      <TableCell colSpan={3}>Total Purchases</TableCell>
                      <TableCell className="text-right">${totalPurchases.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Sales Section */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">Sales Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.shopName}</TableCell>
                        <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-success">
                          ${sale.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-primary">
                          ${sale.profit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold">
                      <TableCell colSpan={3}>Total Sales & Profit</TableCell>
                      <TableCell className="text-right">${totalSales.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${totalProfit.toLocaleString()}</TableCell>
                    </TableRow>
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
