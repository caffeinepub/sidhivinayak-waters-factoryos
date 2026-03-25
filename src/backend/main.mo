import Float "mo:core/Float";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";


import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type CustomerType = {
    #retail;
    #wholesale;
    #hotel;
  };

  type DeliveryStatus = {
    #pending;
    #inTransit;
    #delivered;
  };

  type InvoiceStatus = {
    #paid;
    #partial;
    #unpaid;
  };

  type ProductType = {
    #jar20L;
    #bottle1L;
    #bottle500ml;
    #bottle200ml;
  };

  type Shift = {
    #morning;
    #afternoon;
    #night;
  };

  type BatchStatus = {
    #scheduled;
    #inProgress;
    #completed;
  };

  type KhataEntryType = {
    #credit;
    #debit;
  };

  public type Customer = {
    name : Text;
    phone : Text;
    address : Text;
    customerType : CustomerType;
    email : Text;
  };

  public type Delivery = {
    id : Nat;
    customerId : Nat;
    customerName : Text;
    product : ProductType;
    quantity : Nat;
    truckNumber : Text;
    driverName : Text;
    status : DeliveryStatus;
    date : Int;
    amount : Float;
    remarks : Text;
    paymentMethod : Text;
  };

  public type Invoice = {
    id : Nat;
    series : Text;
    customerId : Nat;
    customerName : Text;
    amount : Float;
    status : InvoiceStatus;
    date : Int;
    items : Text;
    paymentTerms : Text;
  };

  public type InventoryItem = {
    id : Nat;
    name : Text;
    quantity : Nat;
    unit : Text;
    minStock : Nat;
    description : Text;
    supplier : Text;
  };

  public type ProductBatch = {
    id : Nat;
    product : ProductType;
    quantity : Nat;
    shift : Shift;
    date : Int;
    status : BatchStatus;
    batchNumber : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  public type Shop = {
    id : Nat;
    name : Text;
    phone : Text;
    location : Text;
    address : Text;
    contactPerson : Text;
    shopType : CustomerType;
  };

  public type KhataEntry = {
    id : Nat;
    shopId : Nat;
    shopName : Text;
    entryType : KhataEntryType;
    amount : Float;
    description : Text;
    date : Int;
  };

  public type ActivityLog = {
    timestamp : Int;
    user : Principal;
    action : Text;
    details : Text;
  };

  public type ChatMessage = {
    id : Nat;
    sender : Principal;
    senderName : Text;
    content : Text;
    timestamp : Int;
    channel : Text;
  };

  public type RawMaterial = {
    id : Text;
    name : Text;
    quantity : Float;
    unit : Text;
    status : Text; // "Available" | "Low" | "Out of Stock"
    reorderLevel : Float;
    notes : Text;
  };

  public type Dealer = {
    id : Text;
    name : Text;
    company : Text;
    phone : Text;
    material : Text;
    email : Text;
    notes : Text;
  };

  public type Document = {
    id : Text;
    title : Text;
    content : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type StoreInfo = {
    storeName : Text;
    ownerName : Text;
    address : Text;
    phone : Text;
    email : Text;
    gstin : Text;
    licenseNo : Text;
    mapUrl : Text;
  };

  // -------- Stable counters --------
  stable var nextCustomerId = 1;
  stable var nextDeliveryId = 1;
  stable var nextInvoiceId = 1;
  stable var nextInventoryItemId = 1;
  stable var nextBatchId = 1;
  stable var nextShopId = 1;
  stable var nextKhataEntryId = 1;
  stable var nextActivityLogId = 1;
  stable var nextChatMessageId = 1;

  // -------- Stable storage arrays --------
  stable var stableCustomers : [(Nat, Customer)] = [];
  stable var stableDeliveries : [(Nat, Delivery)] = [];
  stable var stableInvoices : [(Nat, Invoice)] = [];
  stable var stableInventoryItems : [(Nat, InventoryItem)] = [];
  stable var stableBatches : [(Nat, ProductBatch)] = [];
  stable var stableShops : [(Nat, Shop)] = [];
  stable var stableKhataEntries : [(Nat, KhataEntry)] = [];
  stable var stableActivityLogs : [(Nat, ActivityLog)] = [];
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  stable var stableChatMessages : [(Nat, ChatMessage)] = [];
  stable var stableRawMaterials : [(Text, RawMaterial)] = [];
  stable var stableDealers : [(Text, Dealer)] = [];
  stable var stableDocuments : [(Text, Document)] = [];
  stable var stableStoreInfo : StoreInfo = {
    storeName = "Sidhivinayak Waters";
    ownerName = "Jayant";
    address = "Pune, India";
    phone = "1234567890";
    email = "info@sidhivinayakwaters.com";
    gstin = "GSTIN123";
    licenseNo = "LIC123";
    mapUrl = "https://maps.google.com/?q=pune";
  };

  // -------- In-memory maps (rebuilt on upgrade) --------
  var customers = Map.empty<Nat, Customer>();
  var deliveries = Map.empty<Nat, Delivery>();
  var invoices = Map.empty<Nat, Invoice>();
  var inventoryItems = Map.empty<Nat, InventoryItem>();
  var batches = Map.empty<Nat, ProductBatch>();
  var shops = Map.empty<Nat, Shop>();
  var khataEntries = Map.empty<Nat, KhataEntry>();
  var activityLogs = Map.empty<Nat, ActivityLog>();
  var userProfiles = Map.empty<Principal, UserProfile>();
  var chatMessages = Map.empty<Nat, ChatMessage>();
  var rawMaterialMap = Map.empty<Text, RawMaterial>();
  var dealerMap = Map.empty<Text, Dealer>();
  var documentMap = Map.empty<Text, Document>();
  var storeInfo : StoreInfo = stableStoreInfo;

  // Restore maps from stable arrays on first load
  do {
    for ((k, v) in stableCustomers.vals()) { customers.add(k, v) };
    for ((k, v) in stableDeliveries.vals()) { deliveries.add(k, v) };
    for ((k, v) in stableInvoices.vals()) { invoices.add(k, v) };
    for ((k, v) in stableInventoryItems.vals()) { inventoryItems.add(k, v) };
    for ((k, v) in stableBatches.vals()) { batches.add(k, v) };
    for ((k, v) in stableShops.vals()) { shops.add(k, v) };
    for ((k, v) in stableKhataEntries.vals()) { khataEntries.add(k, v) };
    for ((k, v) in stableActivityLogs.vals()) { activityLogs.add(k, v) };
    for ((k, v) in stableUserProfiles.vals()) { userProfiles.add(k, v) };
    for ((k, v) in stableChatMessages.vals()) { chatMessages.add(k, v) };
    for ((k, v) in stableRawMaterials.vals()) { rawMaterialMap.add(k, v) };
    for ((k, v) in stableDealers.vals()) { dealerMap.add(k, v) };
    for ((k, v) in stableDocuments.vals()) { documentMap.add(k, v) };
  };

  // -------- Upgrade hooks --------
  system func preupgrade() {
    stableCustomers := customers.entries().toArray();
    stableDeliveries := deliveries.entries().toArray();
    stableInvoices := invoices.entries().toArray();
    stableInventoryItems := inventoryItems.entries().toArray();
    stableBatches := batches.entries().toArray();
    stableShops := shops.entries().toArray();
    stableKhataEntries := khataEntries.entries().toArray();
    stableActivityLogs := activityLogs.entries().toArray();
    stableUserProfiles := userProfiles.entries().toArray();
    stableChatMessages := chatMessages.entries().toArray();
    stableRawMaterials := rawMaterialMap.entries().toArray();
    stableDealers := dealerMap.entries().toArray();
    stableDocuments := documentMap.entries().toArray();
    stableStoreInfo := storeInfo;
  };

  system func postupgrade() {
    customers := Map.empty<Nat, Customer>();
    deliveries := Map.empty<Nat, Delivery>();
    invoices := Map.empty<Nat, Invoice>();
    inventoryItems := Map.empty<Nat, InventoryItem>();
    batches := Map.empty<Nat, ProductBatch>();
    shops := Map.empty<Nat, Shop>();
    khataEntries := Map.empty<Nat, KhataEntry>();
    activityLogs := Map.empty<Nat, ActivityLog>();
    userProfiles := Map.empty<Principal, UserProfile>();
    chatMessages := Map.empty<Nat, ChatMessage>();
    rawMaterialMap := Map.empty<Text, RawMaterial>();
    dealerMap := Map.empty<Text, Dealer>();
    documentMap := Map.empty<Text, Document>();
    for ((k, v) in stableCustomers.vals()) { customers.add(k, v) };
    for ((k, v) in stableDeliveries.vals()) { deliveries.add(k, v) };
    for ((k, v) in stableInvoices.vals()) { invoices.add(k, v) };
    for ((k, v) in stableInventoryItems.vals()) { inventoryItems.add(k, v) };
    for ((k, v) in stableBatches.vals()) { batches.add(k, v) };
    for ((k, v) in stableShops.vals()) { shops.add(k, v) };
    for ((k, v) in stableKhataEntries.vals()) { khataEntries.add(k, v) };
    for ((k, v) in stableActivityLogs.vals()) { activityLogs.add(k, v) };
    for ((k, v) in stableUserProfiles.vals()) { userProfiles.add(k, v) };
    for ((k, v) in stableChatMessages.vals()) { chatMessages.add(k, v) };
    for ((k, v) in stableRawMaterials.vals()) { rawMaterialMap.add(k, v) };
    for ((k, v) in stableDealers.vals()) { dealerMap.add(k, v) };
    for ((k, v) in stableDocuments.vals()) { documentMap.add(k, v) };
    storeInfo := stableStoreInfo;
  };

  //--------------- Raw Material Management ----------------

  public shared ({ caller }) func addRawMaterial(material : RawMaterial) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    rawMaterialMap.add(material.id, material);
  };

  public shared ({ caller }) func updateRawMaterial(id : Text, material : RawMaterial) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    if (not rawMaterialMap.containsKey(id)) { Runtime.trap("Raw material not found!") };
    rawMaterialMap.add(id, material);
  };

  public shared ({ caller }) func deleteRawMaterial(id : Text) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    rawMaterialMap.remove(id);
  };

  public query ({ caller }) func getRawMaterial(id : Text) : async ?RawMaterial {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    rawMaterialMap.get(id);
  };

  public query ({ caller }) func getAllRawMaterials() : async [RawMaterial] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    rawMaterialMap.values().toArray();
  };

  //--------------- Dealer Management ----------------

  public shared ({ caller }) func addDealer(dealer : Dealer) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    dealerMap.add(dealer.id, dealer);
  };

  public shared ({ caller }) func updateDealer(id : Text, dealer : Dealer) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    if (not dealerMap.containsKey(id)) { Runtime.trap("Dealer not found!") };
    dealerMap.add(id, dealer);
  };

  public shared ({ caller }) func deleteDealer(id : Text) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    dealerMap.remove(id);
  };

  public query ({ caller }) func getDealer(id : Text) : async ?Dealer {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    dealerMap.get(id);
  };

  public query ({ caller }) func getAllDealers() : async [Dealer] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    dealerMap.values().toArray();
  };

  //--------------- Document Management ----------------

  public shared ({ caller }) func addDocument(document : Document) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    documentMap.add(document.id, document);
  };

  public shared ({ caller }) func updateDocument(id : Text, document : Document) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    if (not documentMap.containsKey(id)) { Runtime.trap("Document not found!") };
    documentMap.add(id, document);
  };

  public shared ({ caller }) func deleteDocument(id : Text) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    documentMap.remove(id);
  };

  public query ({ caller }) func getDocument(id : Text) : async ?Document {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    documentMap.get(id);
  };

  public query ({ caller }) func getAllDocuments() : async [Document] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    documentMap.values().toArray();
  };

  //--------------- Store Info Management ----------------

  public query ({ caller }) func getStoreInfo() : async StoreInfo {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    storeInfo;
  };

  public shared ({ caller }) func updateStoreInfo(info : StoreInfo) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    storeInfo := info;
  };

  //--------------- User Profile Management ----------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    userProfiles.add(caller, profile);
  };

  //--------------- Customer Management ----------------

  public shared ({ caller }) func addCustomer(customer : Customer) : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let id = nextCustomerId;
    nextCustomerId += 1;
    customers.add(id, customer);
    logActivity(caller, "addCustomer", customer.name);
    id;
  };

  public query ({ caller }) func getCustomer(id : Nat) : async ?Customer {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    customers.get(id);
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    customers.values().toArray();
  };

  public shared ({ caller }) func updateCustomer(id : Nat, customer : Customer) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    if (not customers.containsKey(id)) { Runtime.trap("Customer not found!") };
    customers.add(id, customer);
    logActivity(caller, "updateCustomer", customer.name);
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    customers.remove(id);
  };

  //--------------- Shop Management ----------------

  public shared ({ caller }) func addShop(shop : Shop) : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let id = nextShopId;
    nextShopId += 1;
    let newShop = { shop with id };
    shops.add(id, newShop);
    id;
  };

  public query ({ caller }) func getShop(id : Nat) : async ?Shop {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    shops.get(id);
  };

  public query ({ caller }) func getAllShops() : async [Shop] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    shops.values().toArray();
  };

  public shared ({ caller }) func updateShop(id : Nat, shop : Shop) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    shops.add(id, { shop with id });
  };

  public shared ({ caller }) func deleteShop(id : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    shops.remove(id);
  };

  //--------------- Khata Entries ----------------

  public shared ({ caller }) func addKhataEntry(entry : KhataEntry) : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let id = nextKhataEntryId;
    nextKhataEntryId += 1;
    let newEntry = { entry with id };
    khataEntries.add(id, newEntry);
    id;
  };

  public query ({ caller }) func getKhataEntry(id : Nat) : async ?KhataEntry {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    khataEntries.get(id);
  };

  public query ({ caller }) func getAllKhataEntries() : async [KhataEntry] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    khataEntries.values().toArray();
  };

  public query ({ caller }) func getKhataEntriesByShop(shopId : Nat) : async [KhataEntry] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    khataEntries.values().filter(func(e) { e.shopId == shopId }).toArray();
  };

  public shared ({ caller }) func deleteKhataEntry(id : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    khataEntries.remove(id);
  };

  public query ({ caller }) func getShopBalance(shopId : Nat) : async Float {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    var totalCredit : Float = 0.0;
    var totalDebit : Float = 0.0;

    for (entry in khataEntries.values()) {
      if (entry.shopId == shopId) {
        switch (entry.entryType) {
          case (#credit) { totalCredit += entry.amount };
          case (#debit) { totalDebit += entry.amount };
        };
      };
    };
    totalCredit - totalDebit;
  };

  //--------------- Delivery Management ----------------

  public shared ({ caller }) func addDelivery(delivery : Delivery) : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let id = nextDeliveryId;
    nextDeliveryId += 1;
    let newDelivery = { delivery with id };
    deliveries.add(id, newDelivery);
    id;
  };

  public query ({ caller }) func getDelivery(id : Nat) : async ?Delivery {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    deliveries.get(id);
  };

  public query ({ caller }) func getAllDeliveries() : async [Delivery] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    deliveries.values().toArray();
  };

  public query ({ caller }) func getDeliveriesByCustomer(customerId : Nat) : async [Delivery] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    deliveries.values().filter(func(d) { d.customerId == customerId }).toArray();
  };

  public shared ({ caller }) func updateDelivery(id : Nat, delivery : Delivery) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    deliveries.add(id, { delivery with id });
  };

  public shared ({ caller }) func deleteDelivery(id : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    deliveries.remove(id);
  };

  //--------------- Inventory Management ----------------

  public shared ({ caller }) func addInventoryItem(item : InventoryItem) : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let id = nextInventoryItemId;
    nextInventoryItemId += 1;
    let newItem = { item with id };
    inventoryItems.add(id, newItem);
    id;
  };

  public query ({ caller }) func getInventoryItem(id : Nat) : async ?InventoryItem {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    inventoryItems.get(id);
  };

  public query ({ caller }) func getAllInventoryItems() : async [InventoryItem] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    inventoryItems.values().toArray();
  };

  public shared ({ caller }) func updateInventoryItem(id : Nat, item : InventoryItem) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    inventoryItems.add(id, { item with id });
  };

  public shared ({ caller }) func deleteInventoryItem(id : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    inventoryItems.remove(id);
  };

  //--------------- Invoicing ----------------

  public shared ({ caller }) func createInvoice(invoice : Invoice) : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let id = nextInvoiceId;
    nextInvoiceId += 1;
    let newInvoice = { invoice with id };
    invoices.add(id, newInvoice);
    id;
  };

  public query ({ caller }) func getInvoice(id : Nat) : async ?Invoice {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    invoices.get(id);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    invoices.values().toArray();
  };

  public query ({ caller }) func getInvoicesByCustomer(customerId : Nat) : async [Invoice] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    invoices.values().filter(func(i) { i.customerId == customerId }).toArray();
  };

  public shared ({ caller }) func updateInvoice(id : Nat, invoice : Invoice) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    invoices.add(id, { invoice with id });
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    invoices.remove(id);
  };

  //--------------- Production Batches ----------------

  public shared ({ caller }) func addProductionBatch(batch : ProductBatch) : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let id = nextBatchId;
    nextBatchId += 1;
    let newBatch = { batch with id };
    batches.add(id, newBatch);
    id;
  };

  public query ({ caller }) func getBatch(id : Nat) : async ?ProductBatch {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    batches.get(id);
  };

  public query ({ caller }) func getAllBatches() : async [ProductBatch] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    batches.values().toArray();
  };

  public shared ({ caller }) func updateBatch(id : Nat, batch : ProductBatch) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    batches.add(id, { batch with id });
  };

  public shared ({ caller }) func deleteBatch(id : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    batches.remove(id);
  };

  //--------------- Chat Messages ----------------

  public shared ({ caller }) func sendChatMessage(channel : Text, content : Text, senderName : Text) : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let id = nextChatMessageId;
    nextChatMessageId += 1;
    let msg : ChatMessage = {
      id;
      sender = caller;
      senderName;
      content;
      timestamp = Time.now();
      channel;
    };
    chatMessages.add(id, msg);
    id;
  };

  public query ({ caller }) func getChatMessages(channel : Text) : async [ChatMessage] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    chatMessages.values().filter(func(m) { m.channel == channel }).toArray();
  };

  public query ({ caller }) func getRecentChatMessages(channel : Text, limit : Nat) : async [ChatMessage] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    let filtered = chatMessages.values().filter(func(m) { m.channel == channel }).toArray();
    let total = filtered.size();
    if (total <= limit) { return filtered };
    Array.tabulate<ChatMessage>(limit, func(i) { filtered[total - limit + i] });
  };

  //--------------- Activity Logging ----------------

  func logActivity(user : Principal, action : Text, details : Text) {
    let timestamp = Time.now();
    let logEntry : ActivityLog = {
      timestamp;
      user;
      action;
      details;
    };
    activityLogs.add(nextActivityLogId, logEntry);
    nextActivityLogId += 1;
  };

  public query ({ caller }) func getAllActivityLogs() : async [ActivityLog] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    activityLogs.values().toArray();
  };

  //--------------- Utility Functions ----------------

  public query ({ caller }) func getPendingDeliveries() : async [Delivery] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    deliveries.values().filter(
      func(d) { d.status == #pending }
    ).toArray();
  };

  public query ({ caller }) func getLowStockItems() : async [InventoryItem] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    inventoryItems.values().filter(
      func(item) { item.quantity < item.minStock }
    ).toArray();
  };

  public query ({ caller }) func getDeliveriesByDateRange(startDate : Int, endDate : Int) : async [Delivery] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    deliveries.values().filter(
      func(d) { d.date >= startDate and d.date <= endDate }
    ).toArray();
  };

  public query ({ caller }) func getProductionByDateRange(startDate : Int, endDate : Int) : async [ProductBatch] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Login required!") };
    batches.values().filter(
      func(b) { b.date >= startDate and b.date <= endDate }
    ).toArray();
  };
};
