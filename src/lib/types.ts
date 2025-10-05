export interface Company {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  totalPurchases: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  companyId: string;
  companyName: string;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  purchaseDate: string;
  receiptUrl?: string;
  notes?: string;
}

export interface MedicalShop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  totalSales: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  shopId: string;
  shopName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  saleDate: string;
  profit: number;
  invoiceNumber: string;
}

export interface DashboardStats {
  totalPurchases: number;
  totalSales: number;
  totalProfit: number;
  totalCompanies: number;
  totalShops: number;
  monthlyData: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  purchases: number;
  sales: number;
  profit: number;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'sale';
  party: string;
  amount: number;
  date: string;
  quantity: number;
}
