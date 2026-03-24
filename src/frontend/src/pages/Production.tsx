import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Clock, Factory } from "lucide-react";
import { motion } from "motion/react";
import { productionBatches } from "../data/sampleData";

const statusColors: Record<string, { bg: string; text: string }> = {
  Completed: {
    bg: "oklch(0.73 0.17 150 / 0.12)",
    text: "oklch(0.73 0.17 150)",
  },
  "In-Progress": {
    bg: "oklch(0.55 0.2 260 / 0.12)",
    text: "oklch(0.65 0.18 250)",
  },
  Scheduled: { bg: "oklch(0.73 0.16 65 / 0.12)", text: "oklch(0.73 0.16 65)" },
};

export default function Production() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Production</h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Today's production batches & shift overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-600 text-success"
            style={{
              background: "oklch(0.73 0.17 150 / 0.1)",
              border: "1px solid oklch(0.73 0.17 150 / 0.3)",
            }}
          >
            3 Shifts Running
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Completed",
            count: "2",
            icon: CheckCircle2,
            color: "oklch(0.73 0.17 150)",
          },
          {
            label: "In-Progress",
            count: "2",
            icon: Factory,
            color: "oklch(0.65 0.18 250)",
          },
          {
            label: "Scheduled",
            count: "2",
            icon: Clock,
            color: "oklch(0.73 0.16 65)",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-4 card-glow"
              style={{ background: "oklch(0.13 0.015 240)" }}
            >
              <Icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
              <p className="text-2xl font-700 text-foreground">{s.count}</p>
              <p className="text-xs text-muted-custom">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-xl card-glow overflow-hidden"
        style={{ background: "oklch(0.13 0.015 240)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <h2 className="text-base font-600 text-foreground">
            Production Batches
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-ocid="production.table">
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(0.17 0.018 240)" }}>
                {[
                  "Batch ID",
                  "Product",
                  "Quantity",
                  "Shift",
                  "Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-600 text-tertiary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productionBatches.map((batch, i) => {
                const sc = statusColors[batch.status];
                return (
                  <tr
                    key={batch.id}
                    data-ocid={`production.item.${i + 1}`}
                    className="border-b transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: "oklch(0.17 0.018 240)" }}
                  >
                    <td className="px-5 py-3.5 text-xs font-600 text-neon">
                      {batch.id}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-foreground">
                      {batch.product}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-custom">
                      {batch.quantity}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-custom">
                      {batch.shift}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-custom flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {batch.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className="text-[10px] font-600 border-0"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {batch.status}
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
