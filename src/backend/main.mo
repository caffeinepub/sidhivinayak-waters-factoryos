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

  var nextCustomerId = 1;
  var nextDeliveryId = 1;
  var nextInvoiceId = 1;
  var nextInventoryItemId = 1;
  var nextBatchId = 1;
  var nextShopId = 1;
  var nextKhataEntryId = 1;
  var nextActivityLogId = 1;
  var nextChatMessageId = 1;

  let customers = Map.empty<Nat, Customer>();
  let deliveries = Map.empty<Nat, Delivery>();
  let invoices = Map.empty<Nat, Invoice>();
  let inventoryItems = Map.empty<Nat, InventoryItem>();
  let batches = Map.empty<Nat, ProductBatch>();
  let shops = Map.empty<Nat, Shop>();
  let khataEntries = Map.empty<Nat, KhataEntry>();
  let activityLogs = Map.empty<Nat, ActivityLog>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let chatMessages = Map.empty<Nat, ChatMessage>();

  let rawMaterialMap = Map.empty<Text, RawMaterial>();
  let dealerMap = Map.empty<Text, Dealer>();
  let documentMap = Map.empty<Text, Document>();

  var storeInfo : StoreInfo = {
    storeName = "Sidhivinayak Waters";
    ownerName = "Jayant";
    address = "Pune, India";
    phone = "1234567890";
    email = "info@sidhivinayakwaters.com";
    gstin = "GSTIN123";
    licenseNo = "LIC123";
    mapUrl = "https://maps.google.com/?q=pune";
  };

  //--------------- Raw Material Management ----------------

  public shared ({ caller }) func addRawMaterial(material : RawMaterial) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add raw materials!");
    };
    rawMaterialMap.add(material.id, material);
  };

  public shared ({ caller }) func updateRawMaterial(id : Text, material : RawMaterial) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update raw materials!");
    };
    if (not rawMaterialMap.containsKey(id)) { Runtime.trap("Raw material not found!") };
    rawMaterialMap.add(id, material);
  };

  public shared ({ caller }) func deleteRawMaterial(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete raw materials!");
    };
    rawMaterialMap.remove(id);
  };

  public query ({ caller }) func getRawMaterial(id : Text) : async ?RawMaterial {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view raw materials!");
    };
    rawMaterialMap.get(id);
  };

  public query ({ caller }) func getAllRawMaterials() : async [RawMaterial] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view raw materials!");
    };
    rawMaterialMap.values().toArray();
  };

  //--------------- Dealer Management ----------------

  public shared ({ caller }) func addDealer(dealer : Dealer) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add dealers!");
    };
    dealerMap.add(dealer.id, dealer);
  };

  public shared ({ caller }) func updateDealer(id : Text, dealer : Dealer) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update dealers!");
    };
    if (not dealerMap.containsKey(id)) { Runtime.trap("Dealer not found!") };
    dealerMap.add(id, dealer);
  };

  public shared ({ caller }) func deleteDealer(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete dealers!");
    };
    dealerMap.remove(id);
  };

  public query ({ caller }) func getDealer(id : Text) : async ?Dealer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view dealers!");
    };
    dealerMap.get(id);
  };

  public query ({ caller }) func getAllDealers() : async [Dealer] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view dealers!");
    };
    dealerMap.values().toArray();
  };

  //--------------- Document Management ----------------

  public shared ({ caller }) func addDocument(document : Document) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add documents!");
    };
    documentMap.add(document.id, document);
  };

  public shared ({ caller }) func updateDocument(id : Text, document : Document) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update documents!");
    };
    if (not documentMap.containsKey(id)) { Runtime.trap("Document not found!") };
    documentMap.add(id, document);
  };

  public shared ({ caller }) func deleteDocument(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete documents!");
    };
    documentMap.remove(id);
  };

  public query ({ caller }) func getDocument(id : Text) : async ?Document {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view documents!");
    };
    documentMap.get(id);
  };

  public query ({ caller }) func getAllDocuments() : async [Document] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view documents!");
    };
    documentMap.values().toArray();
  };

  //--------------- Store Info Management ----------------

  public query ({ caller }) func getStoreInfo() : async StoreInfo {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view store info!");
    };
    storeInfo;
  };

  public shared ({ caller }) func updateStoreInfo(info : StoreInfo) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update store info!");
    };
    storeInfo := info;
  };

  //--------------- User Profile Management ----------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  //--------------- Customer Management ----------------

  public shared ({ caller }) func addCustomer(customer : Customer) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add customers");
    };
    let id = nextCustomerId;
    nextCustomerId += 1;
    customers.add(id, customer);
    logActivity(caller, "addCustomer", customer.name);
    id;
  };

  public query ({ caller }) func getCustomer(id : Nat) : async ?Customer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view customer details");
    };
    customers.get(id);
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view customer details");
    };
    customers.values().toArray();
  };

  public shared ({ caller }) func updateCustomer(id : Nat, customer : Customer) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update customers");
    };
    if (not customers.containsKey(id)) { Runtime.trap("Customer not found!") };
    customers.add(id, customer);
    logActivity(caller, "updateCustomer", customer.name);
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete customers");
    };
    customers.remove(id);
  };

  //--------------- Shop Management ----------------

  public shared ({ caller }) func addShop(shop : Shop) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add shops!");
    };
    let id = nextShopId;
    nextShopId += 1;
    let newShop = { shop with id };
    shops.add(id, newShop);
    id;
  };

  public query ({ caller }) func getShop(id : Nat) : async ?Shop {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view shops");
    };
    shops.get(id);
  };

  public query ({ caller }) func getAllShops() : async [Shop] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view shops");
    };
    shops.values().toArray();
  };

  public shared ({ caller }) func updateShop(id : Nat, shop : Shop) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update shops");
    };
    shops.add(id, { shop with id });
  };

  public shared ({ caller }) func deleteShop(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete shops");
    };
    shops.remove(id);
  };

  //--------------- Khata Entries ----------------

  public shared ({ caller }) func addKhataEntry(entry : KhataEntry) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add khata entries!");
    };
    let id = nextKhataEntryId;
    nextKhataEntryId += 1;
    let newEntry = { entry with id };
    khataEntries.add(id, newEntry);
    id;
  };

  public query ({ caller }) func getKhataEntry(id : Nat) : async ?KhataEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view khata entries");
    };
    khataEntries.get(id);
  };

  public query ({ caller }) func getAllKhataEntries() : async [KhataEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view khata entries");
    };
    khataEntries.values().toArray();
  };

  public query ({ caller }) func getKhataEntriesByShop(shopId : Nat) : async [KhataEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view khata entries");
    };
    khataEntries.values().filter(func(e) { e.shopId == shopId }).toArray();
  };

  public shared ({ caller }) func deleteKhataEntry(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete khata entries");
    };
    khataEntries.remove(id);
  };

  public query ({ caller }) func getShopBalance(shopId : Nat) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view shop balances");
    };
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add deliveries");
    };
    let id = nextDeliveryId;
    nextDeliveryId += 1;
    let newDelivery = { delivery with id };
    deliveries.add(id, newDelivery);
    id;
  };

  public query ({ caller }) func getDelivery(id : Nat) : async ?Delivery {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view deliveries");
    };
    deliveries.get(id);
  };

  public query ({ caller }) func getAllDeliveries() : async [Delivery] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view deliveries");
    };
    deliveries.values().toArray();
  };

  public query ({ caller }) func getDeliveriesByCustomer(customerId : Nat) : async [Delivery] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view deliveries");
    };
    deliveries.values().filter(func(d) { d.customerId == customerId }).toArray();
  };

  public shared ({ caller }) func updateDelivery(id : Nat, delivery : Delivery) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update deliveries");
    };
    deliveries.add(id, { delivery with id });
  };

  public shared ({ caller }) func deleteDelivery(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete deliveries");
    };
    deliveries.remove(id);
  };

  //--------------- Inventory Management ----------------

  public shared ({ caller }) func addInventoryItem(item : InventoryItem) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add inventory items!");
    };
    let id = nextInventoryItemId;
    nextInventoryItemId += 1;
    let newItem = { item with id };
    inventoryItems.add(id, newItem);
    id;
  };

  public query ({ caller }) func getInventoryItem(id : Nat) : async ?InventoryItem {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view inventory items");
    };
    inventoryItems.get(id);
  };

  public query ({ caller }) func getAllInventoryItems() : async [InventoryItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view inventory items");
    };
    inventoryItems.values().toArray();
  };

  public shared ({ caller }) func updateInventoryItem(id : Nat, item : InventoryItem) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update inventory");
    };
    inventoryItems.add(id, { item with id });
  };

  public shared ({ caller }) func deleteInventoryItem(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete inventory items");
    };
    inventoryItems.remove(id);
  };

  //--------------- Invoicing ----------------

  public shared ({ caller }) func createInvoice(invoice : Invoice) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can create invoices");
    };
    let id = nextInvoiceId;
    nextInvoiceId += 1;
    let newInvoice = { invoice with id };
    invoices.add(id, newInvoice);
    id;
  };

  public query ({ caller }) func getInvoice(id : Nat) : async ?Invoice {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view invoices");
    };
    invoices.get(id);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view invoices");
    };
    invoices.values().toArray();
  };

  public query ({ caller }) func getInvoicesByCustomer(customerId : Nat) : async [Invoice] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view invoices");
    };
    invoices.values().filter(func(i) { i.customerId == customerId }).toArray();
  };

  public shared ({ caller }) func updateInvoice(id : Nat, invoice : Invoice) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update invoices");
    };
    invoices.add(id, { invoice with id });
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete invoices");
    };
    invoices.remove(id);
  };

  //--------------- Production Batches ----------------

  public shared ({ caller }) func addProductionBatch(batch : ProductBatch) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can add batches!");
    };
    let id = nextBatchId;
    nextBatchId += 1;
    let newBatch = { batch with id };
    batches.add(id, newBatch);
    id;
  };

  public query ({ caller }) func getBatch(id : Nat) : async ?ProductBatch {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view production batches");
    };
    batches.get(id);
  };

  public query ({ caller }) func getAllBatches() : async [ProductBatch] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view production batches");
    };
    batches.values().toArray();
  };

  public shared ({ caller }) func updateBatch(id : Nat, batch : ProductBatch) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authorized users can update batches");
    };
    batches.add(id, { batch with id });
  };

  public shared ({ caller }) func deleteBatch(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete production batches");
    };
    batches.remove(id);
  };

  //--------------- Chat Messages ----------------

  public shared ({ caller }) func sendChatMessage(channel : Text, content : Text, senderName : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can read messages");
    };
    chatMessages.values().filter(func(m) { m.channel == channel }).toArray();
  };

  public query ({ caller }) func getRecentChatMessages(channel : Text, limit : Nat) : async [ChatMessage] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can read messages");
    };
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view activity logs");
    };
    activityLogs.values().toArray();
  };

  //--------------- Utility Functions ----------------

  public query ({ caller }) func getPendingDeliveries() : async [Delivery] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view deliveries");
    };
    deliveries.values().filter(
      func(d) { d.status == #pending }
    ).toArray();
  };

  public query ({ caller }) func getLowStockItems() : async [InventoryItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view inventory");
    };
    inventoryItems.values().filter(
      func(item) { item.quantity < item.minStock }
    ).toArray();
  };

  public query ({ caller }) func getDeliveriesByDateRange(startDate : Int, endDate : Int) : async [Delivery] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view deliveries");
    };
    deliveries.values().filter(
      func(d) { d.date >= startDate and d.date <= endDate }
    ).toArray();
  };

  public query ({ caller }) func getProductionByDateRange(startDate : Int, endDate : Int) : async [ProductBatch] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Can only view production");
    };
    batches.values().filter(
      func(b) { b.date >= startDate and b.date <= endDate }
    ).toArray();
  };
};
