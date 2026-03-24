import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monthlyProduction, monthlyRevenue } from "../data/sampleData";

const tooltipStyle = {
  backgroundColor: "oklch(0.15 0.016 240)",
  border: "1px solid oklch(0.75 0.13 188 / 0.2)",
  borderRadius: "8px",
  color: "oklch(0.93 0.01 220)",
  fontSize: "12px",
};

const deliveryDonut = [
  { name: "Delivered", value: 68, color: "oklch(0.73 0.17 150)" },
  { name: "In-Transit", value: 24, color: "oklch(0.65 0.18 250)" },
  { name: "Pending", value: 8, color: "oklch(0.73 0.16 65)" },
];

export default function Reports() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-xs text-muted-custom mt-0.5">
          6-month analytics overview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Production */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl card-glow p-5"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Monthly Production (Liters)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={monthlyProduction}
              margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.21 0.02 240)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.52 0.02 220)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.52 0.02 220)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${(v / 1000).toFixed(0)}kL`]}
              />
              <Bar
                dataKey="liters"
                fill="oklch(0.75 0.13 188)"
                radius={[4, 4, 0, 0]}
                style={{
                  filter: "drop-shadow(0 0 4px oklch(0.75 0.13 188 / 0.4))",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-xl card-glow p-5"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Monthly Revenue (₹)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={monthlyRevenue}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.21 0.02 240)"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.52 0.02 220)", fontSize: 11 }}
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
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.65 0.18 250)"
                strokeWidth={2.5}
                dot={{ fill: "oklch(0.65 0.18 250)", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 5, fill: "oklch(0.85 0.14 188)" }}
                style={{
                  filter: "drop-shadow(0 0 4px oklch(0.55 0.2 260 / 0.5))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Delivery Donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-xl card-glow p-5"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Delivery Success Rate
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={deliveryDonut}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {deliveryDonut.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Legend
                formatter={(val) => (
                  <span
                    style={{ color: "oklch(0.66 0.02 220)", fontSize: "12px" }}
                  >
                    {val}
                  </span>
                )}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-xl card-glow p-5"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">
            Key Insights
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Best Production Month",
                value: "March 2026 — 1.94M L",
                color: "oklch(0.75 0.13 188)",
              },
              {
                label: "Revenue Growth (6M)",
                value: "+50% (Oct → Mar)",
                color: "oklch(0.73 0.17 150)",
              },
              {
                label: "Avg Daily Production",
                value: "62,500 L/day",
                color: "oklch(0.65 0.18 250)",
              },
              {
                label: "Delivery Success Rate",
                value: "68% same-day",
                color: "oklch(0.73 0.17 150)",
              },
              {
                label: "Top Revenue Month",
                value: "March 2026 — ₹4.2L",
                color: "oklch(0.75 0.13 188)",
              },
              {
                label: "Pending Collections",
                value: "₹33,600 (2 invoices)",
                color: "oklch(0.73 0.16 65)",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "oklch(0.17 0.018 240)" }}
              >
                <span className="text-xs text-muted-custom">{item.label}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
