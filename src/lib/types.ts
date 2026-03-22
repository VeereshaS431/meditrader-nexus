export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  dlNumber?: string;
  totalPurchases: number;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  hsnCode: string;
  pack: string;
  category: string;
  manufacturer: string;
  currentStock: number;
  reorderLevel: number;
  avgPurchasePrice: number;
  sellingPrice: number;
  gstPercent: number;
}

export interface PurchaseItem {
  id: string;
  medicineId: string;
  medicineName: string;
  hsnCode: string;
  pack: string;
  batch: string;
  quantity: number;
  freeQty: number;
  mfgDate?: string;
  expiryDate: string;
  mrp: number;
  rate: number;
  gstPercent: number;
  amount: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  purchaseDate: string;
  items: PurchaseItem[];
  grossTotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  netPayable: number;
  receiptUrl?: string;
  notes?: string;
  paymentMode: 'cash' | 'credit';
  payments: Payment[];
  paidAmount: number;
}

export interface SaleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  hsnCode: string;
  pack: string;
  batch: string;
  quantity: number;
  mrp: number;
  rate: number;
  gstPercent: number;
  amount: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  shopId: string;
  shopName: string;
  saleDate: string;
  items: SaleItem[];
  grossTotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  netPayable: number;
  profit: number;
  paymentMode: 'cash' | 'credit';
  payments: Payment[];
  paidAmount: number;
}

export interface MedicalShop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  dlNumber?: string;
  totalSales: number;
  createdAt: string;
}

export interface DashboardStats {
  totalPurchases: number;
  totalSales: number;
  totalProfit: number;
  totalVendors: number;
  totalShops: number;
  totalMedicines: number;
  lowStockCount: number;
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
  invoiceNumber: string;
  amount: number;
  date: string;
  itemCount: number;
}
