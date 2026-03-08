import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockMonthlyData, mockCompanies, mockShops, mockPurchases, mockSales, mockMedicines } from "@/lib/mockData";
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

  const totalUnits = mockSales.reduce((s, sale) => s + sale.items.reduce((t, i) => t + i.quantity, 0), 0);
  const totalSalesAmt = mockSales.reduce((s, sale) => s + sale.netPayable, 0);
  const totalPurchaseAmt = mockPurchases.reduce((s, p) => s + p.netPayable, 0);
  const totalProfit = mockSales.reduce((s, sale) => s + sale.profit, 0);

  const profitMarginData = mockSales.map(s => ({
    shop: s.shopName.split(' ')[0],
    margin: totalSalesAmt > 0 ? ((s.profit / s.netPayable) * 100).toFixed(1) : '0'
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-primary rounded-xl p-8 text-white shadow-medium">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-white/80">Deep insights into your business performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Avg. Purchase', value: `₹${(totalPurchaseAmt / Math.max(mockPurchases.length, 1)).toFixed(0)}`, icon: TrendingDown, color: 'text-destructive' },
          { label: 'Avg. Sale', value: `₹${(totalSalesAmt / Math.max(mockSales.length, 1)).toFixed(0)}`, icon: TrendingUp, color: 'text-success' },
          { label: 'Profit Margin', value: `${totalSalesAmt > 0 ? ((totalProfit / totalSalesAmt) * 100).toFixed(1) : 0}%`, icon: DollarSign, color: 'text-primary' },
          { label: 'Total Units Sold', value: totalUnits.toLocaleString(), icon: Package, color: 'text-accent' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * (i + 1) }}>
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockMonthlyData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 65% 45%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(142 65% 45%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(186 65% 45%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(186 65% 45%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="hsl(142 65% 45%)" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                  <Area type="monotone" dataKey="purchases" stroke="hsl(186 65% 45%)" fillOpacity={1} fill="url(#colorPurchases)" name="Purchases" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Profit Margin by Shop</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitMarginData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="shop" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="margin" fill="hsl(168 60% 50%)" radius={[8, 8, 0, 0]} name="Profit Margin %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Purchase Distribution by Company</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={companyData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="purchases">
                    {companyData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Shop Performance Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shopData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
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
