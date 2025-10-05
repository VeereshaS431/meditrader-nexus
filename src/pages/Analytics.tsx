import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockMonthlyData, mockCompanies, mockShops, mockPurchases, mockSales } from "@/lib/mockData";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['hsl(186 65% 45%)', 'hsl(168 60% 50%)', 'hsl(195 60% 55%)', 'hsl(142 65% 45%)', 'hsl(200 60% 50%)'];

export default function Analytics() {
  const companyData = mockCompanies.map(c => ({
    name: c.name.split(' ')[0],
    purchases: c.totalPurchases
  }));

  const shopData = mockShops.map(s => ({
    name: s.name.split(' ')[0],
    sales: s.totalSales
  }));

  const profitMarginData = mockSales.map(s => {
    const purchase = mockPurchases.find(p => p.quantity === s.quantity);
    const margin = purchase ? ((s.totalAmount - purchase.totalCost) / s.totalAmount * 100) : 50;
    return {
      shop: s.shopName.split(' ')[0],
      margin: margin.toFixed(1)
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary rounded-xl p-8 text-white shadow-medium">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-white/80">Deep insights into your business performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Purchase</p>
                  <p className="text-2xl font-bold">
                    ${(mockPurchases.reduce((s, p) => s + p.totalCost, 0) / mockPurchases.length).toFixed(0)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Sale</p>
                  <p className="text-2xl font-bold">
                    ${(mockSales.reduce((s, p) => s + p.totalAmount, 0) / mockSales.length).toFixed(0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold">
                    {((mockSales.reduce((s, p) => s + p.profit, 0) / mockSales.reduce((s, p) => s + p.totalAmount, 0)) * 100).toFixed(1)}%
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                  <p className="text-2xl font-bold">
                    {mockSales.reduce((s, p) => s + p.quantity, 0).toLocaleString()}
                  </p>
                </div>
                <Package className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockMonthlyData.filter(d => d.purchases > 0)}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 65% 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142 65% 45%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(186 65% 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(186 65% 45%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="hsl(142 65% 45%)" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                  <Area type="monotone" dataKey="purchases" stroke="hsl(186 65% 45%)" fillOpacity={1} fill="url(#colorPurchases)" name="Purchases" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profit Margin by Shop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Profit Margin by Shop</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitMarginData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="shop" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="margin" fill="hsl(168 60% 50%)" radius={[8, 8, 0, 0]} name="Profit Margin %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Company Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Purchase Distribution by Company</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={companyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="purchases"
                  >
                    {companyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shop Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Shop Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shopData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="sales" fill="hsl(142 65% 45%)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
