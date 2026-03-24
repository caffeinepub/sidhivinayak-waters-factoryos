import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type CustomerType = {
    #retail;
    #wholesale;
    #hotel;
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

  type KhataEntryType = {
    #credit;
    #debit;
  };

  type Customer = {
    name : Text;
    phone : Text;
    address : Text;
    customerType : CustomerType;
    email : Text;
  };

  type Delivery = {
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

  type Invoice = {
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

  type InventoryItem = {
    id : Nat;
    name : Text;
    quantity : Nat;
    unit : Text;
    minStock : Nat;
    description : Text;
    supplier : Text;
  };

  type ProductBatch = {
    id : Nat;
    product : ProductType;
    quantity : Nat;
    shift : Shift;
    date : Int;
    status : BatchStatus;
    batchNumber : Text;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  type Shop = {
    id : Nat;
    name : Text;
    phone : Text;
    location : Text;
    address : Text;
    contactPerson : Text;
    shopType : CustomerType;
  };

  type KhataEntry = {
    id : Nat;
    shopId : Nat;
    shopName : Text;
    entryType : KhataEntryType;
    amount : Float;
    description : Text;
    date : Int;
  };

  type ActivityLog = {
    timestamp : Int;
    user : Principal;
    action : Text;
    details : Text;
  };

  type OldActor = {
    customers : Map.Map<Nat, Customer>;
    deliveries : Map.Map<Nat, Delivery>;
    invoices : Map.Map<Nat, Invoice>;
    inventoryItems : Map.Map<Nat, InventoryItem>;
    batches : Map.Map<Nat, ProductBatch>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextCustomerId : Nat;
    nextDeliveryId : Nat;
    nextInvoiceId : Nat;
    nextInventoryItemId : Nat;
    nextBatchId : Nat;
  };

  type NewActor = {
    nextCustomerId : Nat;
    nextDeliveryId : Nat;
    nextInvoiceId : Nat;
    nextInventoryItemId : Nat;
    nextBatchId : Nat;
    nextShopId : Nat;
    nextKhataEntryId : Nat;
    nextActivityLogId : Nat;
    customers : Map.Map<Nat, Customer>;
    deliveries : Map.Map<Nat, Delivery>;
    invoices : Map.Map<Nat, Invoice>;
    inventoryItems : Map.Map<Nat, InventoryItem>;
    batches : Map.Map<Nat, ProductBatch>;
    shops : Map.Map<Nat, Shop>;
    khataEntries : Map.Map<Nat, KhataEntry>;
    activityLogs : Map.Map<Nat, ActivityLog>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      nextCustomerId = old.nextCustomerId;
      nextDeliveryId = old.nextDeliveryId;
      nextInvoiceId = old.nextInvoiceId;
      nextInventoryItemId = old.nextInventoryItemId;
      nextBatchId = old.nextBatchId;
      nextShopId = 1;
      nextKhataEntryId = 1;
      nextActivityLogId = 1;
      customers = old.customers;
      deliveries = old.deliveries;
      invoices = old.invoices;
      inventoryItems = old.inventoryItems;
      batches = old.batches;
      shops = Map.empty<Nat, Shop>();
      khataEntries = Map.empty<Nat, KhataEntry>();
      activityLogs = Map.empty<Nat, ActivityLog>();
      userProfiles = old.userProfiles;
    };
  };
};
