import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface KhataEntry {
    id: bigint;
    entryType: KhataEntryType;
    shopId: bigint;
    date: bigint;
    description: string;
    shopName: string;
    amount: number;
}
export interface ActivityLog {
    action: string;
    user: Principal;
    timestamp: bigint;
    details: string;
}
export interface Invoice {
    id: bigint;
    customerName: string;
    status: InvoiceStatus;
    date: bigint;
    series: string;
    customerId: bigint;
    paymentTerms: string;
    items: string;
    amount: number;
}
export interface Customer {
    customerType: CustomerType;
    name: string;
    email: string;
    address: string;
    phone: string;
}
export interface InventoryItem {
    id: bigint;
    supplier: string;
    name: string;
    unit: string;
    description: string;
    minStock: bigint;
    quantity: bigint;
}
export interface ProductBatch {
    id: bigint;
    status: BatchStatus;
    date: bigint;
    shift: Shift;
    batchNumber: string;
    quantity: bigint;
    product: ProductType;
}
export interface Delivery {
    id: bigint;
    customerName: string;
    status: DeliveryStatus;
    paymentMethod: string;
    date: bigint;
    quantity: bigint;
    customerId: bigint;
    truckNumber: string;
    amount: number;
    driverName: string;
    remarks: string;
    product: ProductType;
}
export interface Shop {
    id: bigint;
    name: string;
    contactPerson: string;
    address: string;
    shopType: CustomerType;
    phone: string;
    location: string;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export enum BatchStatus {
    scheduled = "scheduled",
    completed = "completed",
    inProgress = "inProgress"
}
export enum CustomerType {
    retail = "retail",
    hotel = "hotel",
    wholesale = "wholesale"
}
export enum DeliveryStatus {
    pending = "pending",
    inTransit = "inTransit",
    delivered = "delivered"
}
export enum InvoiceStatus {
    paid = "paid",
    unpaid = "unpaid",
    partial = "partial"
}
export enum KhataEntryType {
    credit = "credit",
    debit = "debit"
}
export enum ProductType {
    bottle200ml = "bottle200ml",
    bottle1L = "bottle1L",
    jar20L = "jar20L",
    bottle500ml = "bottle500ml"
}
export enum Shift {
    morning = "morning",
    night = "night",
    afternoon = "afternoon"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(customer: Customer): Promise<bigint>;
    addDelivery(delivery: Delivery): Promise<bigint>;
    addInventoryItem(item: InventoryItem): Promise<bigint>;
    addKhataEntry(entry: KhataEntry): Promise<bigint>;
    addProductionBatch(batch: ProductBatch): Promise<bigint>;
    addShop(shop: Shop): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createInvoice(invoice: Invoice): Promise<bigint>;
    deleteBatch(id: bigint): Promise<void>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteDelivery(id: bigint): Promise<void>;
    deleteInventoryItem(id: bigint): Promise<void>;
    deleteInvoice(id: bigint): Promise<void>;
    deleteKhataEntry(id: bigint): Promise<void>;
    deleteShop(id: bigint): Promise<void>;
    getAllActivityLogs(): Promise<Array<ActivityLog>>;
    getAllBatches(): Promise<Array<ProductBatch>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllDeliveries(): Promise<Array<Delivery>>;
    getAllInventoryItems(): Promise<Array<InventoryItem>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllKhataEntries(): Promise<Array<KhataEntry>>;
    getAllShops(): Promise<Array<Shop>>;
    getBatch(id: bigint): Promise<ProductBatch | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: bigint): Promise<Customer | null>;
    getDeliveriesByCustomer(customerId: bigint): Promise<Array<Delivery>>;
    getDeliveriesByDateRange(startDate: bigint, endDate: bigint): Promise<Array<Delivery>>;
    getDelivery(id: bigint): Promise<Delivery | null>;
    getInventoryItem(id: bigint): Promise<InventoryItem | null>;
    getInvoice(id: bigint): Promise<Invoice | null>;
    getInvoicesByCustomer(customerId: bigint): Promise<Array<Invoice>>;
    getKhataEntriesByShop(shopId: bigint): Promise<Array<KhataEntry>>;
    getKhataEntry(id: bigint): Promise<KhataEntry | null>;
    getLowStockItems(): Promise<Array<InventoryItem>>;
    getPendingDeliveries(): Promise<Array<Delivery>>;
    getProductionByDateRange(startDate: bigint, endDate: bigint): Promise<Array<ProductBatch>>;
    getShop(id: bigint): Promise<Shop | null>;
    getShopBalance(shopId: bigint): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBatch(id: bigint, batch: ProductBatch): Promise<void>;
    updateCustomer(id: bigint, customer: Customer): Promise<void>;
    updateDelivery(id: bigint, delivery: Delivery): Promise<void>;
    updateInventoryItem(id: bigint, item: InventoryItem): Promise<void>;
    updateInvoice(id: bigint, invoice: Invoice): Promise<void>;
    updateShop(id: bigint, shop: Shop): Promise<void>;
}
