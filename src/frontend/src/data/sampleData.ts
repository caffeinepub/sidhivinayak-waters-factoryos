// ── Sample Data for Sidhivinayak Waters FactoryOS ──

export const kpiData = [
  {
    label: "Daily Production",
    value: "58,400L",
    change: "+8.2%",
    changeType: "up" as const,
    icon: "droplets",
  },
  {
    label: "Current Inventory",
    value: "12,500",
    change: "-2.1%",
    changeType: "down" as const,
    icon: "package",
  },
  {
    label: "Deliveries Today",
    value: "142",
    change: "+15.3%",
    changeType: "up" as const,
    icon: "truck",
  },
  {
    label: "Total Revenue",
    value: "₹4.2 Lakhs",
    change: "+5.7%",
    changeType: "up" as const,
    icon: "indian-rupee",
  },
];

export const productionHourly = [
  { hour: "00", production: 1200 },
  { hour: "01", production: 980 },
  { hour: "02", production: 1050 },
  { hour: "03", production: 1100 },
  { hour: "04", production: 1350 },
  { hour: "05", production: 1800 },
  { hour: "06", production: 2400 },
  { hour: "07", production: 2800 },
  { hour: "08", production: 3200 },
  { hour: "09", production: 3500 },
  { hour: "10", production: 3100 },
  { hour: "11", production: 2900 },
  { hour: "12", production: 2600 },
  { hour: "13", production: 2750 },
  { hour: "14", production: 3000 },
  { hour: "15", production: 3300 },
  { hour: "16", production: 3100 },
  { hour: "17", production: 2800 },
  { hour: "18", production: 2400 },
  { hour: "19", production: 2100 },
  { hour: "20", production: 1900 },
  { hour: "21", production: 1650 },
  { hour: "22", production: 1400 },
  { hour: "23", production: 1220 },
];

export const inventoryItems = [
  { name: "Raw Water", current: 85, unit: "kL", qty: "8,500", min: 40 },
  { name: "20L Jars", current: 62, unit: "units", qty: "6,200", min: 30 },
  { name: "1L Bottles", current: 78, unit: "cases", qty: "7,800", min: 35 },
  { name: "500ml Bottles", current: 45, unit: "cases", qty: "4,500", min: 40 },
  { name: "Caps", current: 90, unit: "gross", qty: "9,000", min: 20 },
  { name: "Labels", current: 55, unit: "rolls", qty: "5,500", min: 30 },
];

export const liveStatus = [
  {
    line: "Line A – 20L Jars",
    status: "Active",
    output: "1,200/hr",
    health: 92,
  },
  {
    line: "Line B – 1L Bottles",
    status: "Active",
    output: "3,600/hr",
    health: 87,
  },
  { line: "Line C – 500ml", status: "Maintenance", output: "0/hr", health: 0 },
  { line: "Line D – 200ml", status: "Active", output: "5,400/hr", health: 95 },
];

export const deliveries = [
  {
    id: "DL-001",
    customer: "Ram Provision Store",
    product: "20L Jars x50",
    truck: "MH-12-AB-1234",
    driver: "Raju Sharma",
    status: "Delivered",
    date: "24 Mar 2026",
    amount: "₹12,400",
  },
  {
    id: "DL-002",
    customer: "City Hospital",
    product: "1L Bottles x200",
    truck: "MH-12-CD-5678",
    driver: "Suresh Patil",
    status: "In-Transit",
    date: "24 Mar 2026",
    amount: "₹28,750",
  },
  {
    id: "DL-003",
    customer: "Fresh Mart",
    product: "500ml x300",
    truck: "MH-12-EF-9012",
    driver: "Mohan Das",
    status: "Pending",
    date: "24 Mar 2026",
    amount: "₹9,600",
  },
  {
    id: "DL-004",
    customer: "Sunrise Hotel",
    product: "20L Jars x80",
    truck: "MH-12-GH-3456",
    driver: "Kiran Rao",
    status: "Delivered",
    date: "24 Mar 2026",
    amount: "₹19,840",
  },
  {
    id: "DL-005",
    customer: "Star Residency",
    product: "1L Bottles x150",
    truck: "MH-12-IJ-7890",
    driver: "Vijay Kumar",
    status: "In-Transit",
    date: "24 Mar 2026",
    amount: "₹7,200",
  },
  {
    id: "DL-006",
    customer: "Om Enterprises",
    product: "20L Jars x120",
    truck: "MH-12-KL-2345",
    driver: "Raju Sharma",
    status: "Pending",
    date: "24 Mar 2026",
    amount: "₹29,760",
  },
  {
    id: "DL-007",
    customer: "Anand Stores",
    product: "500ml x500",
    truck: "MH-12-MN-6789",
    driver: "Suresh Patil",
    status: "Delivered",
    date: "24 Mar 2026",
    amount: "₹16,000",
  },
  {
    id: "DL-008",
    customer: "Greenleaf Cafe",
    product: "1L Bottles x80",
    truck: "MH-12-OP-0123",
    driver: "Mohan Das",
    status: "Pending",
    date: "24 Mar 2026",
    amount: "₹3,840",
  },
];

export const invoices = [
  {
    id: "INV-1042",
    customer: "Ram Provision Store",
    amount: "₹12,400",
    status: "Paid",
    date: "24 Mar 2026",
  },
  {
    id: "INV-1041",
    customer: "City Hospital",
    amount: "₹28,750",
    status: "Partial",
    date: "23 Mar 2026",
  },
  {
    id: "INV-1040",
    customer: "Fresh Mart",
    amount: "₹9,600",
    status: "Unpaid",
    date: "23 Mar 2026",
  },
  {
    id: "INV-1039",
    customer: "Sunrise Hotel",
    amount: "₹19,840",
    status: "Paid",
    date: "22 Mar 2026",
  },
  {
    id: "INV-1038",
    customer: "Star Residency",
    amount: "₹7,200",
    status: "Paid",
    date: "22 Mar 2026",
  },
  {
    id: "INV-1037",
    customer: "Om Enterprises",
    amount: "₹29,760",
    status: "Unpaid",
    date: "21 Mar 2026",
  },
  {
    id: "INV-1036",
    customer: "Anand Stores",
    amount: "₹16,000",
    status: "Partial",
    date: "21 Mar 2026",
  },
  {
    id: "INV-1035",
    customer: "Greenleaf Cafe",
    amount: "₹3,840",
    status: "Paid",
    date: "20 Mar 2026",
  },
];

export const billingMonthly = [
  { month: "Oct", revenue: 280000 },
  { month: "Nov", revenue: 340000 },
  { month: "Dec", revenue: 310000 },
  { month: "Jan", revenue: 390000 },
  { month: "Feb", revenue: 360000 },
  { month: "Mar", revenue: 420000 },
];

export const productionBatches = [
  {
    id: "PB-2801",
    product: "20L Jars",
    quantity: "12,500 units",
    shift: "Morning",
    date: "24 Mar 2026",
    status: "Completed",
  },
  {
    id: "PB-2802",
    product: "1L Bottles",
    quantity: "48,000 bottles",
    shift: "Morning",
    date: "24 Mar 2026",
    status: "Completed",
  },
  {
    id: "PB-2803",
    product: "500ml Bottles",
    quantity: "72,000 bottles",
    shift: "Afternoon",
    date: "24 Mar 2026",
    status: "In-Progress",
  },
  {
    id: "PB-2804",
    product: "200ml Cups",
    quantity: "96,000 cups",
    shift: "Afternoon",
    date: "24 Mar 2026",
    status: "In-Progress",
  },
  {
    id: "PB-2805",
    product: "20L Jars",
    quantity: "8,000 units",
    shift: "Night",
    date: "24 Mar 2026",
    status: "Scheduled",
  },
  {
    id: "PB-2806",
    product: "1L Bottles",
    quantity: "36,000 bottles",
    shift: "Night",
    date: "24 Mar 2026",
    status: "Scheduled",
  },
];

export const monthlyProduction = [
  { month: "Oct", liters: 1520000 },
  { month: "Nov", liters: 1680000 },
  { month: "Dec", liters: 1450000 },
  { month: "Jan", liters: 1820000 },
  { month: "Feb", liters: 1760000 },
  { month: "Mar", liters: 1940000 },
];

export const monthlyRevenue = [
  { month: "Oct", revenue: 280000 },
  { month: "Nov", revenue: 340000 },
  { month: "Dec", revenue: 310000 },
  { month: "Jan", revenue: 390000 },
  { month: "Feb", revenue: 360000 },
  { month: "Mar", revenue: 420000 },
];

export const recentTransactions = [
  { customer: "Ram Provision Store", date: "24 Mar 2026", amount: "₹12,400" },
  { customer: "City Hospital", date: "24 Mar 2026", amount: "₹28,750" },
  { customer: "Fresh Mart", date: "23 Mar 2026", amount: "₹9,600" },
  { customer: "Sunrise Hotel", date: "22 Mar 2026", amount: "₹19,840" },
];
