import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MapPin, Truck } from "lucide-react";
import { motion } from "motion/react";
import { deliveries } from "../data/sampleData";

const statusStyle: Record<string, { bg: string; text: string }> = {
  Delivered: {
    bg: "oklch(0.73 0.17 150 / 0.12)",
    text: "oklch(0.73 0.17 150)",
  },
  "In-Transit": {
    bg: "oklch(0.55 0.2 260 / 0.12)",
    text: "oklch(0.65 0.18 250)",
  },
  Pending: { bg: "oklch(0.73 0.16 65 / 0.12)", text: "oklch(0.73 0.16 65)" },
};

export default function Delivery() {
  const stats = [
    { label: "Total Deliveries", value: "142", color: "oklch(0.75 0.13 188)" },
    { label: "Delivered", value: "98", color: "oklch(0.73 0.17 150)" },
    { label: "In-Transit", value: "44", color: "oklch(0.65 0.18 250)" },
    { label: "Trucks Active", value: "8", color: "oklch(0.73 0.16 65)" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-700 text-foreground">Delivery</h1>
        <p className="text-xs text-muted-custom mt-0.5">
          Today's delivery operations
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl p-4 card-glow"
            style={{ background: "oklch(0.13 0.015 240)" }}
          >
            <p className="text-2xl font-700" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs text-muted-custom mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="rounded-xl card-glow overflow-hidden"
        style={{ background: "oklch(0.13 0.015 240)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <h2 className="text-base font-600 text-foreground">
            Delivery Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-ocid="delivery.table">
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(0.17 0.018 240)" }}>
                {[
                  "Order ID",
                  "Customer",
                  "Product",
                  "Truck #",
                  "Driver",
                  "Date",
                  "Amount",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-600 text-tertiary whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d, i) => {
                const sc = statusStyle[d.status];
                return (
                  <tr
                    key={d.id}
                    data-ocid={`delivery.item.${i + 1}`}
                    className="border-b transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: "oklch(0.17 0.018 240)" }}
                  >
                    <td className="px-4 py-3 text-xs font-600 text-neon">
                      {d.id}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">
                      {d.customer}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-custom whitespace-nowrap">
                      {d.product}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-custom whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {d.truck}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-custom whitespace-nowrap">
                      {d.driver}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-custom whitespace-nowrap">
                      {d.date}
                    </td>
                    <td className="px-4 py-3 text-xs font-600 text-success whitespace-nowrap">
                      {d.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className="text-[10px] font-600 border-0 whitespace-nowrap"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
