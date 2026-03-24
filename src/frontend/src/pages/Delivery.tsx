import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  DeliveryStatus,
  Delivery as DeliveryType,
  ProductType,
} from "../backend";
import { useActor } from "../hooks/useActor";

type DeliveryWithId = DeliveryType & { id: bigint };

const blankForm = () => ({
  customerName: "",
  product: "jar20L" as ProductType,
  quantity: "",
  truckNumber: "",
  driverName: "",
  status: "pending" as DeliveryStatus,
  amount: "",
  paymentMethod: "cash",
  remarks: "",
});

const statusStyle: Record<string, { bg: string; text: string }> = {
  delivered: {
    bg: "oklch(0.73 0.17 150 / 0.12)",
    text: "oklch(0.73 0.17 150)",
  },
  inTransit: { bg: "oklch(0.55 0.2 260 / 0.12)", text: "oklch(0.65 0.18 250)" },
  pending: { bg: "oklch(0.73 0.16 65 / 0.12)", text: "oklch(0.73 0.16 65)" },
};

const statusLabel: Record<string, string> = {
  delivered: "Delivered",
  inTransit: "In-Transit",
  pending: "Pending",
};
const productLabel: Record<string, string> = {
  jar20L: "20L Jars",
  bottle1L: "1L Bottles",
  bottle500ml: "500ml",
  bottle200ml: "200ml",
};

export default function Delivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: async () => {
      const list = await actor!.getAllDeliveries();
      return list as unknown as DeliveryWithId[];
    },
    enabled: !!actor,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["deliveries"] });

  const handleSave = async () => {
    if (!actor || !form.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    setSaving(true);
    try {
      await actor.addDelivery({
        id: BigInt(0),
        customerName: form.customerName,
        product: form.product,
        quantity: BigInt(Number.parseInt(form.quantity, 10) || 0),
        truckNumber: form.truckNumber,
        driverName: form.driverName,
        status: form.status,
        amount: Number.parseFloat(form.amount) || 0,
        paymentMethod: form.paymentMethod,
        remarks: form.remarks,
        customerId: BigInt(0),
        date: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Delivery added");
      refresh();
      setOpen(false);
      setForm(blankForm());
    } catch (_e) {
      toast.error("Failed to add delivery");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteDelivery(id);
      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const stats = [
    { label: "Total", value: deliveries.length, color: "oklch(0.75 0.13 188)" },
    {
      label: "Delivered",
      value: deliveries.filter((d) => d.status === "delivered").length,
      color: "oklch(0.73 0.17 150)",
    },
    {
      label: "In-Transit",
      value: deliveries.filter((d) => d.status === "inTransit").length,
      color: "oklch(0.65 0.18 250)",
    },
    {
      label: "Pending",
      value: deliveries.filter((d) => d.status === "pending").length,
      color: "oklch(0.73 0.16 65)",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery</h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Delivery operations
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(blankForm());
            setOpen(true);
          }}
          className="flex items-center gap-2"
          style={{
            background: "oklch(0.75 0.13 188 / 0.15)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
            color: "oklch(0.75 0.13 188)",
          }}
        >
          <Plus className="w-4 h-4" /> Add Delivery
        </Button>
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
            <p className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs text-muted-custom mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl card-glow overflow-hidden"
        style={{ background: "oklch(0.13 0.015 240)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground">
            Delivery Orders
          </h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-custom text-sm">
            Loading...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <Truck className="w-10 h-10 text-tertiary" />
            <p className="text-sm text-muted-custom">No deliveries yet</p>
            <Button
              onClick={() => {
                setForm(blankForm());
                setOpen(true);
              }}
              size="sm"
              style={{
                background: "oklch(0.75 0.13 188 / 0.15)",
                border: "1px solid oklch(0.75 0.13 188 / 0.4)",
                color: "oklch(0.75 0.13 188)",
              }}
            >
              Add Delivery
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.17 0.018 240)" }}>
                  {[
                    "Customer",
                    "Product",
                    "Qty",
                    "Truck #",
                    "Driver",
                    "Amount",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-tertiary whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => {
                  const sc = statusStyle[d.status] || statusStyle.pending;
                  return (
                    <tr
                      key={String(d.id)}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: "oklch(0.17 0.018 240)" }}
                    >
                      <td className="px-4 py-3.5 text-xs font-semibold text-foreground whitespace-nowrap">
                        {d.customerName}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-custom whitespace-nowrap">
                        {productLabel[d.product] || d.product}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-custom">
                        {Number(d.quantity)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-custom whitespace-nowrap">
                        {d.truckNumber}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-custom whitespace-nowrap">
                        {d.driverName}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-success whitespace-nowrap">
                        ₹{d.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          className="text-[10px] font-semibold border-0 whitespace-nowrap"
                          style={{ background: sc.bg, color: sc.text }}
                        >
                          {statusLabel[d.status] || d.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 rounded text-tertiary hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">
                Customer Name *
              </Label>
              <Input
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
                placeholder="Customer name"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Product</Label>
              <Select
                value={form.product}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, product: v as ProductType }))
                }
              >
                <SelectTrigger className="bg-transparent border-white/10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.13 0.015 240)",
                    border: "1px solid oklch(0.21 0.02 240)",
                  }}
                >
                  <SelectItem value="jar20L">20L Jars</SelectItem>
                  <SelectItem value="bottle1L">1L Bottles</SelectItem>
                  <SelectItem value="bottle500ml">500ml Bottles</SelectItem>
                  <SelectItem value="bottle200ml">200ml Cups</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Quantity</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                placeholder="e.g. 50"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Truck Number</Label>
              <Input
                value={form.truckNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, truckNumber: e.target.value }))
                }
                placeholder="e.g. MH-12-AB-1234"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Driver Name</Label>
              <Input
                value={form.driverName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, driverName: e.target.value }))
                }
                placeholder="Driver name"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Amount (₹)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="e.g. 12400"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as DeliveryStatus }))
                }
              >
                <SelectTrigger className="bg-transparent border-white/10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.13 0.015 240)",
                    border: "1px solid oklch(0.21 0.02 240)",
                  }}
                >
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inTransit">In-Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Remarks</Label>
              <Input
                value={form.remarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remarks: e.target.value }))
                }
                placeholder="Optional notes"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-white/10 text-muted-custom"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={handleSave}
              className="flex-1"
              style={{
                background: "oklch(0.75 0.13 188 / 0.2)",
                border: "1px solid oklch(0.75 0.13 188 / 0.5)",
                color: "oklch(0.75 0.13 188)",
              }}
            >
              {saving ? "Saving..." : "Add Delivery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
