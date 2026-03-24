# Sidhivinayak Waters FactoryOS

## Current State
A dark-theme factory control system with: Dashboard, Customers, Production, Inventory, Delivery, Billing, Reports, Settings. Backend has Customer, ProductBatch, Delivery, Invoice, InventoryItem, UserProfile models. Authorization component is installed.

Billing issue: The billing page creates invoices but has no proper bill format with line items, no auto-calculation, and no print/view bill modal. Also the `actor` is null for unauthenticated users causing silent failures.

## Requested Changes (Diff)

### Add
- **QR Code generation** in Production: after creating a batch, show a printable QR code with format: `{company, batch, box, mfg, exp, qty}`. Use `qrcode` npm library.
- **QR Scanner page**: full-screen camera with scanning line animation, shows scanned QR data popup (company, batch, box, mfg, exp, qty)
- **Shops page**: add/edit/delete shops with name, phone, location/address, contactPerson. View delivery history per shop.
- **Khata page** (ledger): credit/debit entries per shop, outstanding balance, date/description. Like a simple ledger.
- **AI Command Center page**: Jarvis-style mock panel with Alerts, Insights, Suggestions sections. Shows computed insights from real backend data (low stock, pending deliveries, unpaid invoices, production stats).
- Backend: Shop model (id, name, phone, location, address, contactPerson, type: retail/wholesale/hotel)
- Backend: KhataEntry model (id, shopId, shopName, entryType: credit/debit, amount, description, date)
- Sidebar: add scanner, shops, khata, ai-panel pages

### Modify
- **Billing page**: complete redesign with line-items support (each item has productName, qty, rate, amount auto-calculated), invoice total auto-sum, a "View Bill" button that opens a printable bill modal showing company header, itemized table, total. Fix create bill flow.
- **Production page**: after creating a batch, show QR code modal with the batch QR data. Add "Show QR" button per batch row.
- Navigation: add 4 new pages to Sidebar and App routing.

### Remove
- Nothing removed

## Implementation Plan
1. Select `qr-code` component
2. Generate updated Motoko backend with Shop and KhataEntry added
3. Build frontend:
   a. Update Sidebar with new nav items (Scanner, Shops, Khata, AI Panel)
   b. Update App.tsx routing for new pages
   c. Fix Billing with line items, auto-calc total, printable bill modal
   d. Update Production with QR code generation modal per batch
   e. New QRScanner page (camera-based scanning)
   f. New Shops page with CRUD
   g. New Khata page with ledger entries per shop
   h. New AI Command Center page with computed insights
4. Generate Sidhivinayak Waters logo
5. Deploy
