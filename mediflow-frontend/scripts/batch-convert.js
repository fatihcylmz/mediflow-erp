// Batch converter: replace gradient stat cards with KPICard in List pages
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const dir = process.argv[2] || '.';
const iconMap = {
  DrugList: 'MedicineBoxOutlined',
  IngredientList: 'ExperimentOutlined',
  InventoryList: 'InboxOutlined',
  InvoiceList: 'FileTextOutlined',
  OrderList: 'ShoppingCartOutlined',
  PaymentTransactionList: 'DollarOutlined',
  PharmacyList: 'ShopOutlined',
  PrescriptionList: 'FileProtectOutlined',
  ReturnList: 'RollbackOutlined',
  SaleList: 'ShoppingCartOutlined',
  ShipmentList: 'TruckOutlined',
  SupplierList: 'ShopOutlined',
  WarehouseList: 'DatabaseOutlined',
  DrugPriceHistoryList: 'DollarOutlined'
};

const files = readdirSync(dir).filter(f => f.endsWith('List.tsx') && f !== 'PaymentTransactionList.tsx');

for (const file of files) {
  const content = readFileSync(join(dir, file), 'utf8');
  if (!content.includes('KPICard')) continue; // Already has KPICard import

  console.log(`Processing ${file}...`);
}

console.log('Done - now applying patterns manually via Edit tool per file.');
