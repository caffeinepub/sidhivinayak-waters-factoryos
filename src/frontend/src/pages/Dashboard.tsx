import { Badge } from "@/components/ui/badge";
import {
  Bell,
  ChevronDown,
  Circle,
  Clock,
  Droplets,
  IndianRupee,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  billingMonthly,
  deliveries,
  inventoryItems,
  kpiData,
  liveStatus,
  productionHourly,
  recentTransactions,
} from "../data/sampleData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  droplets: Droplets,
  package: Package,
  truck: Truck,
  "indian-rupee": IndianRupee,
};

function KpiCard({
  item,
  index,
}: { item: (typeof kpiData)[0]; index: number }) {
  const Icon = iconMap[item.icon];
  const isUp = item.changeType === "up";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-xl p-5 card-glow"
      style={{ background: "oklch(0.13 0.015 240)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: "oklch(0.75 0.13 188 / 0.1)",
            border: "1px solid oklch(0.75 0.13 188 / 0.2)",
          }}
        >
          <Icon className="w-4 h-4 text-neon" />
        </div>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? "text-success" : "text-danger"}`}
        >
          {isUp ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {item.change}
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">
        {item.value}
      </p>
      <p className="text-xs text-muted-custom font-medium mt-0.5">
        {item.label}
      </p>
    </motion.div>
  );
}

const tooltipStyle = {
  backgroundColor: "oklch(0.15 0.016 240)",
  border: "1px solid oklch(0.75 0.13 188 / 0.2)",
  borderRadius: "8px",
  color: "oklch(0.93 0.01 220)",
  fontSize: "12px",
};

export default function Dashboard() {
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

  return (
    <div className="space-y-5">
      {/* Top utility row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome Back, Admin!
          </h1>
          <p className="text-xs text-muted-custom mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {dateStr} · {timeStr}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-custom"
            style={{
              background: "oklch(0.13 0.015 240)",
              border: "1px solid oklch(0.21 0.02 240)",
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search...</span>
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
            <span
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ background: "oklch(0.6 0.22 25)" }}
            />
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-foreground"
            style={{
              background: "oklch(0.75 0.13 188 / 0.2)",
              border: "1px solid oklch(0.75 0.13 188 / 0.4)",
            }}
          >
            A
          </div>
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neon"
            style={{
              background: "oklch(0.75 0.13 188 / 0.08)",
              border: "1px solid oklch(0.75 0.13 188 / 0.3)",
            }}
          >
            Summary <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((item, i) => (
          <KpiCard key={item.label} item={item} index={i} />
        ))}
      </div>

      {/* Production Tracking + Live Status */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="rounded-xl card-glow p-5"
        style={{ background: "oklch(0.13 0.015 240)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Production Tracking
          </h2>
          <span className="text-xs text-muted-custom">Today · Hourly</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={productionHourly}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.21 0.02 240)"
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "oklch(0.52 0.02 220)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "oklch(0.52 0.02 220)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="production"
                  stroke="oklch(0.75 0.13 188)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "oklch(0.85 0.14 188)",
                    stroke: "oklch(0.75 0.13 188)",
                    strokeWidth: 2,
                  }}
                  style={{
                    filter: "drop-shadow(0 0 4px oklch(0.75 0.13 188 / 0.6))",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:w-64 space-y-3">
            <p className="text-sm font-semibold text-foreground">Live Status</p>
            {liveStatus.map((s) => (
              <div key={s.line} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Circle
                      className={`w-2 h-2 fill-current ${s.status === "Active" ? "text-success" : "text-warning"}`}
                    />
                    <span className="text-xs text-foreground">{s.line}</span>
                  </div>
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      color:
                        s.status === "Active"
                          ? "oklch(0.73 0.17 150)"
                          : "oklch(0.73 0.16 65)",
                    }}
                  >
                    {s.status}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.17 0.018 240)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.health}%`,
                      background:
                        s.status === "Active"
                          ? "linear-gradient(90deg, oklch(0.75 0.13 188), oklch(0.73 0.17 150))"
                          : "oklch(0.73 0.16 65)",
                    }}
                  />
                </div>
                <p className="text-[10px] text-tertiary">{s.output}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Inventory + Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
          className="rounded-xl card-glow p-5"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Inventory Levels
          </h2>
          <div className="space-y-3">
            {inventoryItems.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{item.name}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color:
                        item.current < 50
                          ? "oklch(0.73 0.16 65)"
                          : "oklch(0.73 0.17 150)",
                    }}
                  >
                    {item.current}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.17 0.018 240)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.current}%`,
                      background:
                        item.current < 50
                          ? "linear-gradient(90deg, oklch(0.73 0.16 65), oklch(0.73 0.16 65 / 0.7))"
                          : "linear-gradient(90deg, oklch(0.75 0.13 188), oklch(0.85 0.14 188 / 0.7))",
                      boxShadow:
                        item.current < 50
                          ? "0 0 6px oklch(0.73 0.16 65 / 0.4)"
                          : "0 0 6px oklch(0.75 0.13 188 / 0.4)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.4 }}
          className="rounded-xl card-glow p-5"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Delivery Status
            </h2>
            <span className="text-xs text-muted-custom">8 Trucks Active</span>
          </div>
          <div className="space-y-2.5">
            {deliveries.slice(0, 5).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between py-1.5"
              >
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {d.customer}
                  </p>
                  <p className="text-[10px] text-tertiary">{d.product}</p>
                </div>
                <Badge
                  className="text-[10px] font-semibold border-0 px-2 py-0.5"
                  style={{
                    background:
                      d.status === "Delivered"
                        ? "oklch(0.73 0.17 150 / 0.12)"
                        : d.status === "In-Transit"
                          ? "oklch(0.55 0.2 260 / 0.12)"
                          : "oklch(0.73 0.16 65 / 0.12)",
                    color:
                      d.status === "Delivered"
                        ? "oklch(0.73 0.17 150)"
                        : d.status === "In-Transit"
                          ? "oklch(0.65 0.18 250)"
                          : "oklch(0.73 0.16 65)",
                  }}
                >
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Billing + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54, duration: 0.4 }}
          className="rounded-xl card-glow p-5"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Billing Overview
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={billingMonthly}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.21 0.02 240)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.52 0.02 220)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.52 0.02 220)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`₹${(v / 100000).toFixed(2)}L`]}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {billingMonthly.map((entry, idx) => (
                  <Cell
                    key={entry.month}
                    fill={
                      idx === billingMonthly.length - 1
                        ? "oklch(0.75 0.13 188)"
                        : "oklch(0.55 0.2 260)"
                    }
                    style={{
                      filter:
                        idx === billingMonthly.length - 1
                          ? "drop-shadow(0 0 6px oklch(0.75 0.13 188 / 0.5))"
                          : undefined,
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="rounded-xl card-glow p-5"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.customer}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "oklch(0.17 0.018 240)" }}
              >
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {tx.customer}
                  </p>
                  <p className="text-[10px] text-tertiary">{tx.date}</p>
                </div>
                <span className="text-sm font-bold text-success">
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-3 border-t flex items-center justify-between"
            style={{ borderColor: "oklch(0.21 0.02 240)" }}
          >
            <span className="text-xs text-muted-custom">Today's Total</span>
            <span className="text-base font-bold text-neon">₹70,590</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
