import { create } from 'zustand';
import { Vendor, Medicine, Purchase, MedicalShop, Sale, Payment } from './types';
import { mockVendors, mockMedicines, mockPurchases, mockShops, mockSales } from './mockData';

interface AppStore {
  vendors: Vendor[];
  medicines: Medicine[];
  purchases: Purchase[];
  shops: MedicalShop[];
  sales: Sale[];

  addVendor: (v: Vendor) => void;
  updateVendor: (id: string, v: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  addMedicine: (m: Medicine) => void;
  updateMedicine: (id: string, m: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;

  addPurchase: (p: Purchase) => void;
  updatePurchase: (id: string, p: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
  addPurchasePayment: (purchaseId: string, payment: Payment) => void;

  addShop: (s: MedicalShop) => void;
  updateShop: (id: string, s: Partial<MedicalShop>) => void;
  deleteShop: (id: string) => void;

  addSale: (s: Sale) => void;
  updateSale: (id: string, s: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  addSalePayment: (saleId: string, payment: Payment) => void;
}

export const useStore = create<AppStore>((set) => ({
  vendors: [...mockVendors],
  medicines: [...mockMedicines],
  purchases: [...mockPurchases],
  shops: [...mockShops],
  sales: [...mockSales],

  addVendor: (v) => set((s) => ({ vendors: [...s.vendors, v] })),
  updateVendor: (id, data) => set((s) => ({ vendors: s.vendors.map(v => v.id === id ? { ...v, ...data } : v) })),
  deleteVendor: (id) => set((s) => ({ vendors: s.vendors.filter(v => v.id !== id) })),

  addMedicine: (m) => set((s) => ({ medicines: [...s.medicines, m] })),
  updateMedicine: (id, data) => set((s) => ({ medicines: s.medicines.map(m => m.id === id ? { ...m, ...data } : m) })),
  deleteMedicine: (id) => set((s) => ({ medicines: s.medicines.filter(m => m.id !== id) })),

  addPurchase: (p) => set((s) => ({ purchases: [...s.purchases, p] })),
  updatePurchase: (id, data) => set((s) => ({ purchases: s.purchases.map(p => p.id === id ? { ...p, ...data } : p) })),
  deletePurchase: (id) => set((s) => ({ purchases: s.purchases.filter(p => p.id !== id) })),
  addPurchasePayment: (purchaseId, payment) => set((s) => ({
    purchases: s.purchases.map(p => p.id === purchaseId ? {
      ...p,
      payments: [...p.payments, payment],
      paidAmount: p.paidAmount + payment.amount,
    } : p)
  })),

  addShop: (sh) => set((s) => ({ shops: [...s.shops, sh] })),
  updateShop: (id, data) => set((s) => ({ shops: s.shops.map(sh => sh.id === id ? { ...sh, ...data } : sh) })),
  deleteShop: (id) => set((s) => ({ shops: s.shops.filter(sh => sh.id !== id) })),

  addSale: (sale) => set((s) => ({ sales: [...s.sales, sale] })),
  updateSale: (id, data) => set((s) => ({ sales: s.sales.map(sale => sale.id === id ? { ...sale, ...data } : sale) })),
  deleteSale: (id) => set((s) => ({ sales: s.sales.filter(sale => sale.id !== id) })),
  addSalePayment: (saleId, payment) => set((s) => ({
    sales: s.sales.map(sale => sale.id === saleId ? {
      ...sale,
      payments: [...sale.payments, payment],
      paidAmount: sale.paidAmount + payment.amount,
    } : sale)
  })),
}));
