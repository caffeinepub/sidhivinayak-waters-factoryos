import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Lightbulb,
  Loader2,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useActor } from "../hooks/useActor";

const agents = [
  {
    icon: "🧠",
    name: "AI Manager",
    role: "Controls operations & gives suggestions",
    status: "active",
  },
  {
    icon: "📊",
    name: "AI Analyst",
    role: "Sales trends & demand insights",
    status: "active",
  },
  {
    icon: "💼",
    name: "AI CA",
    role: "Profit estimation & payment tracking",
    status: "active",
  },
  {
    icon: "⚖️",
    name: "AI Legal",
    role: "Risk alerts & compliance",
    status: "standby",
  },
  {
    icon: "🧑‍💼",
    name: "AI Operations",
    role: "Tracks managers & detects delays",
    status: "active",
  },
];

export default function AIPanel() {
  const { actor } = useActor();

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await actor!.getAllInvoices()) as any[],
    enabled: !!actor,
  });
  const { data: lowStock = [] } = useQuery({
    queryKey: ["lowStock"],
    queryFn: async () => (await actor!.getLowStockItems()) as any[],
    enabled: !!actor,
  });
  const { data: pendingDeliveries = [] } = useQuery({
    queryKey: ["pendingDeliveries"],
    queryFn: async () => (await actor!.getPendingDeliveries()) as any[],
    enabled: !!actor,
  });
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => (await actor!.getAllBatches()) as any[],
    enabled: !!actor,
  });

  const unpaidInvoices = invoices.filter((i: any) => i.status === "unpaid");
  const unpaidAmount = unpaidInvoices.reduce(
    (s: number, i: any) => s + i.amount,
    0,
  );
  const paidAmount = invoices
    .filter((i: any) => i.status === "paid")
    .reduce((s: number, i: any) => s + i.amount, 0);

  const now = new Date();
  const thisMonthBatches = batches.filter((b: any) => {
    const d = new Date(Number(b.date) / 1_000_000);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  // Most active product
  const productQty: Record<string, number> = {};
  for (const b of batches as any[]) {
    productQty[b.product] = (productQty[b.product] || 0) + Number(b.quantity);
  }
  const topProduct = Object.entries(productQty).sort(
    ([, a], [, b]) => b - a,
  )[0];
  const productLabels: Record<string, string> = {
    jar20L: "20L Jars",
    bottle1L: "1L Bottles",
    bottle500ml: "500ml Bottles",
    bottle200ml: "200ml Cups",
  };

  const today = new Date().toDateString();
  const todayBatches = batches.filter(
    (b: any) => new Date(Number(b.date) / 1_000_000).toDateString() === today,
  );

  const alerts = [
    lowStock.length > 0 && {
      icon: AlertTriangle,
      color: "oklch(0.73 0.16 65)",
      bg: "oklch(0.73 0.16 65 / 0.08)",
      border: "oklch(0.73 0.16 65 / 0.3)",
      text: `${lowStock.length} item${lowStock.length > 1 ? "s" : ""} running low on stock — restock soon`,
    },
    pendingDeliveries.length > 0 && {
      icon: Truck,
      color: "oklch(0.75 0.13 188)",
      bg: "oklch(0.75 0.13 188 / 0.08)",
      border: "oklch(0.75 0.13 188 / 0.3)",
      text: `${pendingDeliveries.length} deliver${pendingDeliveries.length > 1 ? "ies" : "y"} pending dispatch`,
    },
    unpaidInvoices.length > 0 && {
      icon: Wallet,
      color: "oklch(0.6 0.22 25)",
      bg: "oklch(0.6 0.22 25 / 0.08)",
      border: "oklch(0.6 0.22 25 / 0.3)",
      text: `${unpaidInvoices.length} invoice${unpaidInvoices.length > 1 ? "s" : ""} unpaid — ₹${unpaidAmount.toLocaleString("en-IN")} outstanding`,
    },
  ].filter(Boolean) as {
    icon: any;
    color: string;
    bg: string;
    border: string;
    text: string;
  }[];

  const insights = [
    {
      icon: BarChart3,
      color: "oklch(0.75 0.13 188)",
      label: "This Month Production",
      value: `${thisMonthBatches.length} batch${thisMonthBatches.length !== 1 ? "es" : ""}`,
    },
    {
      icon: TrendingUp,
      color: "oklch(0.73 0.17 150)",
      label: "Revenue Collected",
      value: `₹${paidAmount.toLocaleString("en-IN")}`,
    },
    {
      icon: Wallet,
      color: "oklch(0.73 0.16 65)",
      label: "Outstanding Payments",
      value: `₹${unpaidAmount.toLocaleString("en-IN")}`,
    },
    topProduct && {
      icon: BarChart3,
      color: "oklch(0.75 0.13 188)",
      label: "Top Product",
      value: productLabels[topProduct[0]] || topProduct[0],
    },
  ].filter(Boolean) as {
    icon: any;
    color: string;
    label: string;
    value: string;
  }[];

  const suggestions: string[] = [];
  if (unpaidInvoices.length > invoices.length * 0.4 && invoices.length > 0)
    suggestions.push(
      "High unpaid ratio — consider following up with customers",
    );
  if (lowStock.length > 0)
    suggestions.push(
      `Restock these items: ${(lowStock as any[]).map((i) => i.name).join(", ")}`,
    );
  if (todayBatches.length === 0)
    suggestions.push("No production batches logged for today");
  suggestions.push("System running normally — all managers active");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "oklch(0.75 0.13 188 / 0.12)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
          }}
        >
          <Brain className="w-5 h-5 text-neon" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            AI Command Center
          </h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Jarvis-style intelligence panel for FactoryOS
          </p>
        </div>
        {isLoading && (
          <Loader2 className="w-4 h-4 text-neon animate-spin ml-auto" />
        )}
      </div>

      {/* AI Agents */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          AI Agents
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl p-3 text-center card-glow"
              style={{
                background: "oklch(0.13 0.015 240)",
                border: `1px solid ${agent.status === "active" ? "oklch(0.75 0.13 188 / 0.3)" : "oklch(0.21 0.02 240)"}`,
              }}
            >
              <div className="text-2xl mb-2">{agent.icon}</div>
              <p className="text-xs font-bold text-foreground leading-tight">
                {agent.name}
              </p>
              <p className="text-[10px] text-tertiary mt-1 leading-tight">
                {agent.role}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      agent.status === "active"
                        ? "oklch(0.73 0.17 150)"
                        : "oklch(0.5 0 0)",
                    boxShadow:
                      agent.status === "active"
                        ? "0 0 6px oklch(0.73 0.17 150)"
                        : "none",
                    animation:
                      agent.status === "active"
                        ? "pulse 2s ease-in-out infinite"
                        : "none",
                  }}
                />
                <span
                  className="text-[10px]"
                  style={{
                    color:
                      agent.status === "active"
                        ? "oklch(0.73 0.17 150)"
                        : "oklch(0.5 0 0)",
                  }}
                >
                  {agent.status === "active" ? "Active" : "Standby"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          ⚠️ Alerts
        </p>
        {alerts.length === 0 ? (
          <div
            className="rounded-xl p-4 text-sm text-muted-custom"
            style={{ background: "oklch(0.13 0.015 240)" }}
          >
            No active alerts — all systems normal ✅
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((a, alertIdx) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: alertIdx * 0.08 }}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: a.color }}
                  />
                  <p className="text-sm font-medium" style={{ color: a.color }}>
                    {a.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insights */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          📊 Insights
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((ins, insIdx) => {
            const Icon = ins.icon;
            return (
              <motion.div
                key={ins.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: insIdx * 0.07 }}
                className="rounded-xl p-4 card-glow"
                style={{
                  background: "oklch(0.13 0.015 240)",
                  border: `1px solid ${ins.color} / 0.2`,
                }}
              >
                <Icon className="w-4 h-4 mb-2" style={{ color: ins.color }} />
                <p className="text-lg font-bold text-foreground">{ins.value}</p>
                <p className="text-[11px] text-muted-custom mt-0.5">
                  {ins.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          💡 Suggestions
        </p>
        <div className="space-y-2">
          {suggestions.map((s, sugIdx) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sugIdx * 0.08 }}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: "oklch(0.73 0.17 150 / 0.06)",
                border: "1px solid oklch(0.73 0.17 150 / 0.2)",
              }}
            >
              <span
                className="text-sm"
                style={{ color: "oklch(0.73 0.17 150)" }}
              >
                →
              </span>
              <p className="text-sm text-foreground">{s}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
