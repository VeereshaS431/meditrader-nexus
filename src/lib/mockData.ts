import { Company, Medicine, Purchase, PurchaseItem, MedicalShop, Sale, SaleItem, MonthlyData, Transaction } from './types';

export const mockMedicines: Medicine[] = [
  { id: 'm1', name: 'EUPEN 1GM', hsnCode: '3004', pack: '1S', category: 'Antibiotics', manufacturer: 'Cipla', currentStock: 120, reorderLevel: 50, avgPurchasePrice: 148, sellingPrice: 180, gstPercent: 5 },
  { id: 'm2', name: 'CITIFIT-2ML INJ', hsnCode: '30049099', pack: '2ML', category: 'Injections', manufacturer: 'Sun Pharma', currentStock: 85, reorderLevel: 30, avgPurchasePrice: 49, sellingPrice: 65, gstPercent: 5 },
  { id: 'm3', name: 'LABLOL 20MG 4ML', hsnCode: '30049079', pack: '1', category: 'Cardiac', manufacturer: 'Dr. Reddy\'s', currentStock: 15, reorderLevel: 20, avgPurchasePrice: 79, sellingPrice: 100, gstPercent: 5 },
  { id: 'm4', name: 'NEOMOL 100ML', hsnCode: '30045090', pack: '100ML', category: 'Analgesics', manufacturer: 'Cipla', currentStock: 200, reorderLevel: 60, avgPurchasePrice: 22, sellingPrice: 30, gstPercent: 5 },
  { id: 'm5', name: 'EUPEN 250 MG', hsnCode: '30042019', pack: '250MG', category: 'Antibiotics', manufacturer: 'Cipla', currentStock: 8, reorderLevel: 20, avgPurchasePrice: 110, sellingPrice: 140, gstPercent: 5 },
  { id: 'm6', name: 'AMOXYCLAV 625', hsnCode: '30041090', pack: '10S', category: 'Antibiotics', manufacturer: 'Alkem', currentStock: 150, reorderLevel: 40, avgPurchasePrice: 95, sellingPrice: 125, gstPercent: 12 },
  { id: 'm7', name: 'PAN-D CAP', hsnCode: '30049099', pack: '10S', category: 'Gastro', manufacturer: 'Alkem', currentStock: 300, reorderLevel: 80, avgPurchasePrice: 52, sellingPrice: 72, gstPercent: 12 },
  { id: 'm8', name: 'DOLO 650', hsnCode: '30049011', pack: '15S', category: 'Analgesics', manufacturer: 'Micro Labs', currentStock: 500, reorderLevel: 100, avgPurchasePrice: 18, sellingPrice: 30, gstPercent: 5 },
  { id: 'm9', name: 'AZITHRAL 500', hsnCode: '30042090', pack: '3S', category: 'Antibiotics', manufacturer: 'Alembic', currentStock: 45, reorderLevel: 25, avgPurchasePrice: 68, sellingPrice: 90, gstPercent: 5 },
  { id: 'm10', name: 'CALPOL 500', hsnCode: '30049011', pack: '10S', category: 'Analgesics', manufacturer: 'GSK', currentStock: 250, reorderLevel: 50, avgPurchasePrice: 12, sellingPrice: 20, gstPercent: 5 },
];

export const mockCompanies: Company[] = [
  { id: '1', name: 'Rudra Medical Distributors', contactPerson: 'Ramesh Kumar', phone: '6303435070', email: 'rudra@medicals.com', address: 'D.No.7-2-125a, Ground Floor, Vydyanadham Street, Amalapuram, E.G Dist, AP - 533201', gstNumber: '37DBEPR9766Q1ZC', dlNumber: 'WLF20B/2025/AP/001037', totalPurchases: 78390, createdAt: '2024-01-15' },
  { id: '2', name: 'Sri Pharma Agencies', contactPerson: 'Suresh Babu', phone: '9876543210', email: 'sripharma@gmail.com', address: '45, Gandhi Road, Kakinada, AP', gstNumber: '37ABCDE1234F1Z5', totalPurchases: 156000, createdAt: '2024-02-20' },
  { id: '3', name: 'Lakshmi Drug House', contactPerson: 'Venkat Rao', phone: '9988776655', email: 'lakshmi.drugs@gmail.com', address: '12, MG Road, Rajahmundry, AP', gstNumber: '37FGHIJ5678K1Z9', totalPurchases: 98500, createdAt: '2024-01-10' },
  { id: '4', name: 'Sai Krishna Medicals', contactPerson: 'Krishna Murthy', phone: '8877665544', email: 'saikrishna@medicals.com', address: '78, Nehru Street, Vijayawada, AP', gstNumber: '37LMNOP9012Q1Z3', totalPurchases: 125000, createdAt: '2024-03-05' },
  { id: '5', name: 'Ganesh Pharma Distributors', contactPerson: 'Ganesh Yadav', phone: '7766554433', email: 'ganesh.pharma@gmail.com', address: '23, Station Road, Eluru, AP', gstNumber: '37RSTUV3456W1Z7', totalPurchases: 87500, createdAt: '2024-02-12' },
];

const purchaseItems1: PurchaseItem[] = [
  { id: 'pi1', medicineId: 'm1', medicineName: 'EUPEN 1GM', hsnCode: '3004', pack: '1S', batch: '289143', quantity: 12, freeQty: 0, expiryDate: '2026-12-01', mrp: 1067, rate: 148, gstPercent: 5, amount: 1776 },
  { id: 'pi2', medicineId: 'm2', medicineName: 'CITIFIT-2ML INJ', hsnCode: '30049099', pack: '2ML', batch: 'MN25095A', quantity: 20, freeQty: 0, expiryDate: '2027-06-01', mrp: 399, rate: 49, gstPercent: 5, amount: 980 },
  { id: 'pi3', medicineId: 'm3', medicineName: 'LABLOL 20MG 4ML', hsnCode: '30049079', pack: '1', batch: '388087', quantity: 20, freeQty: 0, expiryDate: '2026-10-01', mrp: 223.5, rate: 79, gstPercent: 5, amount: 1580 },
  { id: 'pi4', medicineId: 'm4', medicineName: 'NEOMOL 100ML', hsnCode: '30045090', pack: '100ML', batch: '383T933', quantity: 20, freeQty: 0, expiryDate: '2027-07-01', mrp: 574, rate: 24, gstPercent: 5, amount: 480 },
  { id: 'pi5', medicineId: 'm4', medicineName: 'NEOMOL 100ML', hsnCode: '30045090', pack: '100ML', batch: '383T951', quantity: 100, freeQty: 0, expiryDate: '2027-08-01', mrp: 538, rate: 21, gstPercent: 5, amount: 2100 },
  { id: 'pi6', medicineId: 'm5', medicineName: 'EUPEN 250 MG', hsnCode: '30042019', pack: '250MG', batch: '31049', quantity: 5, freeQty: 0, expiryDate: '2027-07-01', mrp: 500.63, rate: 110, gstPercent: 5, amount: 550 },
];

const purchaseItems2: PurchaseItem[] = [
  { id: 'pi7', medicineId: 'm6', medicineName: 'AMOXYCLAV 625', hsnCode: '30041090', pack: '10S', batch: 'AX2589', quantity: 50, freeQty: 5, expiryDate: '2027-03-01', mrp: 185, rate: 95, gstPercent: 12, amount: 4750 },
  { id: 'pi8', medicineId: 'm7', medicineName: 'PAN-D CAP', hsnCode: '30049099', pack: '10S', batch: 'PD4412', quantity: 100, freeQty: 10, expiryDate: '2027-05-01', mrp: 98, rate: 52, gstPercent: 12, amount: 5200 },
  { id: 'pi9', medicineId: 'm8', medicineName: 'DOLO 650', hsnCode: '30049011', pack: '15S', batch: 'DL7821', quantity: 200, freeQty: 20, expiryDate: '2027-09-01', mrp: 32, rate: 18, gstPercent: 5, amount: 3600 },
];

const purchaseItems3: PurchaseItem[] = [
  { id: 'pi10', medicineId: 'm9', medicineName: 'AZITHRAL 500', hsnCode: '30042090', pack: '3S', batch: 'AZ1190', quantity: 30, freeQty: 3, expiryDate: '2027-01-01', mrp: 120, rate: 68, gstPercent: 5, amount: 2040 },
  { id: 'pi11', medicineId: 'm10', medicineName: 'CALPOL 500', hsnCode: '30049011', pack: '10S', batch: 'CP8834', quantity: 150, freeQty: 15, expiryDate: '2027-04-01', mrp: 25, rate: 12, gstPercent: 5, amount: 1800 },
];

export const mockPurchases: Purchase[] = [
  {
    id: 'p1', invoiceNumber: 'GST0154', companyId: '1', companyName: 'Rudra Medical Distributors',
    purchaseDate: '2025-12-25', items: purchaseItems1,
    grossTotal: 7466, discount: 0, cgst: 186.65, sgst: 186.65, netPayable: 7839,
    receiptUrl: '/receipts/gst0154.pdf', notes: 'Regular monthly order'
  },
  {
    id: 'p2', invoiceNumber: 'SP-2024-089', companyId: '2', companyName: 'Sri Pharma Agencies',
    purchaseDate: '2025-12-20', items: purchaseItems2,
    grossTotal: 13550, discount: 200, cgst: 802.2, sgst: 802.2, netPayable: 14954.4,
    receiptUrl: '/receipts/sp089.pdf'
  },
  {
    id: 'p3', invoiceNumber: 'LDH-2024-045', companyId: '3', companyName: 'Lakshmi Drug House',
    purchaseDate: '2025-12-18', items: purchaseItems3,
    grossTotal: 3840, discount: 0, cgst: 96, sgst: 96, netPayable: 4032
  },
];

export const mockShops: MedicalShop[] = [
  { id: 's1', name: 'Sri Lakshmi Manikanta Pharmacy', ownerName: 'Manikanta', phone: '9876512340', email: 'manikanta@pharmacy.com', address: 'Main Road, Amalapuram, AP', gstNumber: '37GGUPM4892N1Z1', dlNumber: '20B 33249', totalSales: 45000, createdAt: '2024-01-05' },
  { id: 's2', name: 'Sai Ram Medical Store', ownerName: 'Sai Kumar', phone: '9876543210', email: 'sairam@medicals.com', address: 'Gandhi Road, Kakinada, AP', totalSales: 38000, createdAt: '2024-01-12' },
  { id: 's3', name: 'Durga Pharmacy', ownerName: 'Durga Prasad', phone: '8765432109', email: 'durga@pharmacy.com', address: 'Station Road, Rajahmundry, AP', totalSales: 52000, createdAt: '2024-02-01' },
  { id: 's4', name: 'Venu Medical & General', ownerName: 'Venu Gopal', phone: '7654321098', email: 'venu@medicals.com', address: 'MG Road, Eluru, AP', totalSales: 28000, createdAt: '2024-02-15' },
  { id: 's5', name: 'Ravi Teja Pharma', ownerName: 'Ravi Teja', phone: '6543210987', email: 'raviteja@pharma.com', address: 'Nehru Street, Vijayawada, AP', totalSales: 61000, createdAt: '2024-01-20' },
];

const saleItems1: SaleItem[] = [
  { id: 'si1', medicineId: 'm1', medicineName: 'EUPEN 1GM', hsnCode: '3004', pack: '1S', batch: '289143', quantity: 5, mrp: 1067, rate: 180, gstPercent: 5, amount: 900 },
  { id: 'si2', medicineId: 'm4', medicineName: 'NEOMOL 100ML', hsnCode: '30045090', pack: '100ML', batch: '383T933', quantity: 10, mrp: 574, rate: 30, gstPercent: 5, amount: 300 },
];

const saleItems2: SaleItem[] = [
  { id: 'si3', medicineId: 'm6', medicineName: 'AMOXYCLAV 625', hsnCode: '30041090', pack: '10S', batch: 'AX2589', quantity: 20, mrp: 185, rate: 125, gstPercent: 12, amount: 2500 },
  { id: 'si4', medicineId: 'm8', medicineName: 'DOLO 650', hsnCode: '30049011', pack: '15S', batch: 'DL7821', quantity: 50, mrp: 32, rate: 30, gstPercent: 5, amount: 1500 },
  { id: 'si5', medicineId: 'm7', medicineName: 'PAN-D CAP', hsnCode: '30049099', pack: '10S', batch: 'PD4412', quantity: 30, mrp: 98, rate: 72, gstPercent: 12, amount: 2160 },
];

const saleItems3: SaleItem[] = [
  { id: 'si6', medicineId: 'm9', medicineName: 'AZITHRAL 500', hsnCode: '30042090', pack: '3S', batch: 'AZ1190', quantity: 10, mrp: 120, rate: 90, gstPercent: 5, amount: 900 },
  { id: 'si7', medicineId: 'm10', medicineName: 'CALPOL 500', hsnCode: '30049011', pack: '10S', batch: 'CP8834', quantity: 50, mrp: 25, rate: 20, gstPercent: 5, amount: 1000 },
  { id: 'si8', medicineId: 'm2', medicineName: 'CITIFIT-2ML INJ', hsnCode: '30049099', pack: '2ML', batch: 'MN25095A', quantity: 10, mrp: 399, rate: 65, gstPercent: 5, amount: 650 },
];

const saleItems4: SaleItem[] = [
  { id: 'si9', medicineId: 'm3', medicineName: 'LABLOL 20MG 4ML', hsnCode: '30049079', pack: '1', batch: '388087', quantity: 8, mrp: 223.5, rate: 100, gstPercent: 5, amount: 800 },
  { id: 'si10', medicineId: 'm5', medicineName: 'EUPEN 250 MG', hsnCode: '30042019', pack: '250MG', batch: '31049', quantity: 3, mrp: 500.63, rate: 140, gstPercent: 5, amount: 420 },
];

export const mockSales: Sale[] = [
  {
    id: 'sale1', invoiceNumber: 'INV-2025-001', shopId: 's1', shopName: 'Sri Lakshmi Manikanta Pharmacy',
    saleDate: '2025-12-27', items: saleItems1,
    grossTotal: 1200, discount: 0, cgst: 30, sgst: 30, netPayable: 1260,
    profit: 310
  },
  {
    id: 'sale2', invoiceNumber: 'INV-2025-002', shopId: 's2', shopName: 'Sai Ram Medical Store',
    saleDate: '2025-12-28', items: saleItems2,
    grossTotal: 6160, discount: 100, cgst: 336, sgst: 336, netPayable: 6732,
    profit: 2280
  },
  {
    id: 'sale3', invoiceNumber: 'INV-2025-003', shopId: 's3', shopName: 'Durga Pharmacy',
    saleDate: '2025-12-29', items: saleItems3,
    grossTotal: 2550, discount: 0, cgst: 63.75, sgst: 63.75, netPayable: 2677.5,
    profit: 920
  },
  {
    id: 'sale4', invoiceNumber: 'INV-2025-004', shopId: 's4', shopName: 'Venu Medical & General',
    saleDate: '2025-12-30', items: saleItems4,
    grossTotal: 1220, discount: 0, cgst: 30.5, sgst: 30.5, netPayable: 1281,
    profit: 565
  },
];

export const mockMonthlyData: MonthlyData[] = [
  { month: 'Jul', purchases: 15000, sales: 22000, profit: 5500 },
  { month: 'Aug', purchases: 18000, sales: 25000, profit: 6200 },
  { month: 'Sep', purchases: 22000, sales: 28000, profit: 7100 },
  { month: 'Oct', purchases: 19500, sales: 26500, profit: 6800 },
  { month: 'Nov', purchases: 24000, sales: 32000, profit: 8200 },
  { month: 'Dec', purchases: 26825, sales: 11950, profit: 4075 },
];

export const mockTransactions: Transaction[] = [
  ...mockPurchases.map(p => ({
    id: p.id,
    type: 'purchase' as const,
    party: p.companyName,
    invoiceNumber: p.invoiceNumber,
    amount: p.netPayable,
    date: p.purchaseDate,
    itemCount: p.items.length,
  })),
  ...mockSales.map(s => ({
    id: s.id,
    type: 'sale' as const,
    party: s.shopName,
    invoiceNumber: s.invoiceNumber,
    amount: s.netPayable,
    date: s.saleDate,
    itemCount: s.items.length,
  })),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
