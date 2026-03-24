import { AlertTriangle, Package } from "lucide-react";
import { motion } from "motion/react";
import { inventoryItems } from "../data/sampleData";

export default function Inventory() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-700 text-foreground">Inventory</h1>
        <p className="text-xs text-muted-custom mt-0.5">
          Stock levels and thresholds
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: "6", color: "oklch(0.75 0.13 188)" },
          { label: "Well Stocked", value: "3", color: "oklch(0.73 0.17 150)" },
          { label: "Low Stock", value: "2", color: "oklch(0.73 0.16 65)" },
          { label: "Critical", value: "1", color: "oklch(0.6 0.22 25)" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
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

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {inventoryItems.map((item, i) => {
          const isLow = item.current < 50;
          const isCritical = item.current < item.min + 10;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
              className="rounded-xl p-5 card-glow"
              style={{ background: "oklch(0.13 0.015 240)" }}
              data-ocid={`inventory.item.${i + 1}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: isLow
                        ? "oklch(0.73 0.16 65 / 0.1)"
                        : "oklch(0.75 0.13 188 / 0.1)",
                      border: `1px solid ${isLow ? "oklch(0.73 0.16 65 / 0.3)" : "oklch(0.75 0.13 188 / 0.2)"}`,
                    }}
                  >
                    <Package
                      className="w-4 h-4"
                      style={{
                        color: isLow
                          ? "oklch(0.73 0.16 65)"
                          : "oklch(0.75 0.13 188)",
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-600 text-foreground">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-tertiary">
                      {item.qty} {item.unit}
                    </p>
                  </div>
                </div>
                {isCritical && (
                  <div className="flex items-center gap-1 text-[10px] text-warning">
                    <AlertTriangle className="w-3 h-3" />
                    Low
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-custom">Current Stock</span>
                  <span
                    className="font-700"
                    style={{
                      color: isLow
                        ? "oklch(0.73 0.16 65)"
                        : "oklch(0.75 0.13 188)",
                    }}
                  >
                    {item.current}%
                  </span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.17 0.018 240)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.current}%`,
                      background: isLow
                        ? "linear-gradient(90deg, oklch(0.73 0.16 65), oklch(0.73 0.16 65 / 0.6))"
                        : "linear-gradient(90deg, oklch(0.75 0.13 188), oklch(0.85 0.14 188 / 0.7))",
                      boxShadow: `0 0 8px ${isLow ? "oklch(0.73 0.16 65 / 0.4)" : "oklch(0.75 0.13 188 / 0.4)"}`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-tertiary">
                  <span>Min threshold: {item.min}%</span>
                  <span>
                    {item.current >= 70
                      ? "Well stocked"
                      : item.current >= 50
                        ? "Moderate"
                        : "Low stock"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
