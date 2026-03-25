import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Clock,
  Droplets,
  IndianRupee,
  Package,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useOwner } from "../context/OwnerContext";
import { useActor } from "../hooks/useActor";

export default function Dashboard() {
  const { actor } = useActor();
  const { config } = useOwner();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => actor!.getAllCustomers(),
    enabled: !!actor,
  });
  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => actor!.getAllDeliveries(),
    enabled: !!actor,
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => actor!.getAllInvoices(),
    enabled: !!actor,
  });
  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: () => actor!.getAllBatches(),
    enabled: !!actor,
  });
  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => actor!.getAllInventoryItems(),
    enabled: !!actor,
  });

  const totalRevenue = (invoices as any[]).reduce(
    (sum: number, inv: any) =>
      sum + (inv.status === "paid" ? Number(inv.amount) : 0),
    0,
  );
  const pendingDeliveries = (deliveries as any[]).filter(
    (d: any) => d.status === "pending" || d.status === "inTransit",
  ).length;
  const lowStock = (inventory as any[]).filter(
    (i: any) => Number(i.quantity) <= Number(i.minStock),
  ).length;

  const kpis = [
    {
      label: "Total Customers",
      value: customers.length.toString(),
      icon: Droplets,
      color: "oklch(0.75 0.13 188)",
    },
    {
      label: "Inventory Items",
      value: inventory.length.toString(),
      icon: Package,
      color: lowStock > 0 ? "oklch(0.6 0.22 25)" : "oklch(0.73 0.17 150)",
    },
    {
      label: "Active Deliveries",
      value: pendingDeliveries.toString(),
      icon: Truck,
      color: "oklch(0.65 0.18 250)",
    },
    {
      label: "Revenue Collected",
      value:
        totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : "₹0",
      icon: IndianRupee,
      color: "oklch(0.73 0.17 150)",
    },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isEmpty =
    customers.length === 0 && deliveries.length === 0 && invoices.length === 0;

  return (
    <div className="space-y-5">
      {/* Owner Directives Banner */}
      {config.directives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto rounded-lg"
          style={{
            background: "oklch(0.10 0.012 240)",
            border: "1px solid oklch(0.78 0.15 85 / 0.4)",
            boxShadow: "0 0 20px oklch(0.78 0.15 85 / 0.12)",
          }}
        >
          <div className="flex items-center gap-0 whitespace-nowrap py-2 px-3">
            {config.directives.map((d, i) => (
              <span
                key={d.id}
                className="text-[11px] font-semibold"
                style={{ color: "oklch(0.78 0.15 85)" }}
              >
                {i > 0 && <span className="mx-3 opacity-40">|</span>}⚡ OWNER
                DIRECTIVE: {d.text}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {config.ownerName}!
          </h1>
          <p className="text-xs text-muted-custom mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {dateStr} · {timeStr}
          </p>
        </div>
        <button
          type="button"
          className="relative p-2 rounded-lg"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <Bell className="w-4 h-4 text-muted-custom" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl p-5 card-glow"
              style={{ background: "oklch(0.13 0.015 240)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{
                  background: "oklch(0.75 0.13 188 / 0.1)",
                  border: "1px solid oklch(0.75 0.13 188 / 0.2)",
                }}
              >
                <Icon className="w-4 h-4 text-neon" />
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                {item.value}
              </p>
              <p className="text-xs text-muted-custom font-medium mt-0.5">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl card-glow p-10 flex flex-col items-center gap-4 text-center"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.75 0.13 188 / 0.08)",
              border: "1px solid oklch(0.75 0.13 188 / 0.2)",
            }}
          >
            <Droplets className="w-8 h-8 text-neon" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              Start Filling Your Data
            </p>
            <p className="text-sm text-muted-custom mt-1 max-w-md">
              Use the sidebar to navigate to Customers, Production, Inventory,
              Delivery, or Billing and add your real records. Everything will
              show up here once entered.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Deliveries */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl card-glow p-5"
            style={{ background: "oklch(0.13 0.015 240)" }}
          >
            <h2 className="text-base font-semibold text-foreground mb-4">
              Recent Deliveries
            </h2>
            {(deliveries as any[]).slice(0, 5).map((d: any, i: number) => (
              <div
                key={String(i)}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "oklch(0.17 0.018 240)" }}
              >
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {d.customerName}
                  </p>
                  <p className="text-[10px] text-tertiary">{d.product}</p>
                </div>
                <Badge
                  className="text-[10px] font-semibold border-0"
                  style={{
                    background:
                      d.status === "delivered"
                        ? "oklch(0.73 0.17 150 / 0.12)"
                        : d.status === "inTransit"
                          ? "oklch(0.55 0.2 260 / 0.12)"
                          : "oklch(0.73 0.16 65 / 0.12)",
                    color:
                      d.status === "delivered"
                        ? "oklch(0.73 0.17 150)"
                        : d.status === "inTransit"
                          ? "oklch(0.65 0.18 250)"
                          : "oklch(0.73 0.16 65)",
                  }}
                >
                  {d.status}
                </Badge>
              </div>
            ))}
            {(deliveries as any[]).length === 0 && (
              <p className="text-sm text-muted-custom">No deliveries yet</p>
            )}
          </motion.div>

          {/* Recent Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="rounded-xl card-glow p-5"
            style={{ background: "oklch(0.13 0.015 240)" }}
          >
            <h2 className="text-base font-semibold text-foreground mb-4">
              Recent Invoices
            </h2>
            {(invoices as any[]).slice(0, 5).map((inv: any, i: number) => (
              <div
                key={String(i)}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "oklch(0.17 0.018 240)" }}
              >
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {inv.customerName}
                  </p>
                  <p className="text-[10px] text-tertiary">
                    {new Date(Number(inv.date) / 1_000_000).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <span className="text-sm font-bold text-success">
                  ₹{Number(inv.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
            {(invoices as any[]).length === 0 && (
              <p className="text-sm text-muted-custom">No invoices yet</p>
            )}
          </motion.div>

          {/* Production summary */}
          {batches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.49 }}
              className="rounded-xl card-glow p-5"
              style={{ background: "oklch(0.13 0.015 240)" }}
            >
              <h2 className="text-base font-semibold text-foreground mb-4">
                Production
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {["completed", "inProgress", "scheduled"].map((s) => (
                  <div key={s} className="text-center">
                    <p className="text-xl font-bold text-foreground">
                      {
                        (batches as any[]).filter((b: any) => b.status === s)
                          .length
                      }
                    </p>
                    <p className="text-[10px] text-muted-custom capitalize">
                      {s === "inProgress" ? "In-Progress" : s}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Low Stock Warning */}
          {lowStock > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56 }}
              className="rounded-xl p-5"
              style={{
                background: "oklch(0.6 0.22 25 / 0.08)",
                border: "1px solid oklch(0.6 0.22 25 / 0.3)",
              }}
            >
              <h2
                className="text-base font-semibold mb-2"
                style={{ color: "oklch(0.6 0.22 25)" }}
              >
                ⚠ Low Stock Alert
              </h2>
              <p className="text-sm text-muted-custom">
                {lowStock} inventory item{lowStock > 1 ? "s are" : " is"} below
                minimum stock level. Check the Inventory page.
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
