import { DollarSign, ShoppingCart, TrendingUp, Building2, Store, Pill, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { MonthlyTrendChart, VendorPurchasesChart, ShopSalesChart } from "@/components/dashboard/Charts";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const { purchases, sales, medicines, vendors, shops } = useStore();
  const totalPurchases = purchases.reduce((sum, p) => sum + p.netPayable, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.netPayable, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
  const lowStockCount = medicines.filter(m => m.currentStock <= m.reorderLevel).length;

  const stats = [
    { title: "Total Purchases", value: `₹${totalPurchases.toLocaleString()}`, change: "+12.5%", icon: ShoppingCart },
    { title: "Total Sales", value: `₹${totalSales.toLocaleString()}`, change: "+18.2%", icon: TrendingUp },
    { title: "Total Profit", value: `₹${totalProfit.toLocaleString()}`, change: "+24.7%", icon: DollarSign },
    { title: "Medicines", value: medicines.length.toString(), icon: Pill },
    { title: "Low Stock", value: lowStockCount.toString(), icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-primary rounded-xl p-8 text-white shadow-medium">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-white/80">Welcome back! Here's your business overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyTrendChart />
        <VendorPurchasesChart />
      </div>
      <ShopSalesChart />
      <RecentTransactions />
    </div>
  );
}
