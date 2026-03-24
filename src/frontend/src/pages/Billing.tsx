import { Badge } from "@/components/ui/badge";
import { IndianRupee, Receipt, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { invoices } from "../data/sampleData";

const statusStyle: Record<string, { bg: string; text: string }> = {
  Paid: { bg: "oklch(0.73 0.17 150 / 0.12)", text: "oklch(0.73 0.17 150)" },
  Unpaid: { bg: "oklch(0.6 0.22 25 / 0.12)", text: "oklch(0.6 0.22 25)" },
  Partial: { bg: "oklch(0.73 0.16 65 / 0.12)", text: "oklch(0.73 0.16 65)" },
};

export default function Billing() {
  const totalPaid = invoices.filter((inv) => inv.status === "Paid").length;
  const totalUnpaid = invoices.filter((inv) => inv.status === "Unpaid").length;
  const totalPartial = invoices.filter(
    (inv) => inv.status === "Partial",
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-700 text-foreground">Billing</h1>
        <p className="text-xs text-muted-custom mt-0.5">
          Invoice management and payment tracking
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Invoices",
            value: invoices.length.toString(),
            color: "oklch(0.75 0.13 188)",
          },
          {
            label: "Paid",
            value: totalPaid.toString(),
            color: "oklch(0.73 0.17 150)",
          },
          {
            label: "Partial",
            value: totalPartial.toString(),
            color: "oklch(0.73 0.16 65)",
          },
          {
            label: "Unpaid",
            value: totalUnpaid.toString(),
            color: "oklch(0.6 0.22 25)",
          },
        ].map((s, i) => (
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

      {/* Revenue summary banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl p-5 flex items-center justify-between card-glow"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.13 0.015 240), oklch(0.75 0.13 188 / 0.08))",
          border: "1px solid oklch(0.75 0.13 188 / 0.2)",
        }}
      >
        <div>
          <p className="text-xs text-muted-custom">Total Revenue (March)</p>
          <p className="text-3xl font-700 text-neon mt-1">₹4,20,000</p>
        </div>
        <div className="flex items-center gap-1 text-success text-sm font-600">
          <TrendingUp className="w-4 h-4" />
          +5.7% vs last month
        </div>
      </motion.div>

      {/* Invoice Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
        className="rounded-xl card-glow overflow-hidden"
        style={{ background: "oklch(0.13 0.015 240)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <h2 className="text-base font-600 text-foreground">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-ocid="billing.table">
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(0.17 0.018 240)" }}>
                {["Invoice #", "Customer", "Amount", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-600 text-tertiary"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const sc = statusStyle[inv.status];
                return (
                  <tr
                    key={inv.id}
                    data-ocid={`billing.item.${i + 1}`}
                    className="border-b transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: "oklch(0.17 0.018 240)" }}
                  >
                    <td className="px-5 py-3.5 text-xs font-600 text-neon">
                      {inv.id}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-foreground">
                      {inv.customer}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-600 text-success">
                      {inv.amount}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className="text-[10px] font-600 border-0"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-custom">
                      {inv.date}
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
