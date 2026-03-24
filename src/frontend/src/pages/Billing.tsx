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
import { Eye, Plus, Receipt, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Invoice, InvoiceStatus } from "../backend";
import { useActor } from "../hooks/useActor";

type InvoiceWithId = Invoice & { id: bigint };

interface LineItem {
  _id: string;
  productName: string;
  qty: number;
  rate: number;
}

const blankForm = () => ({
  customerName: "",
  status: "unpaid" as InvoiceStatus,
  series: "",
  paymentTerms: "",
  lineItems: [
    { _id: `li-${Date.now()}`, productName: "", qty: 1, rate: 0 },
  ] as LineItem[],
});

const statusStyle: Record<string, { bg: string; text: string }> = {
  paid: { bg: "oklch(0.73 0.17 150 / 0.12)", text: "oklch(0.73 0.17 150)" },
  unpaid: { bg: "oklch(0.6 0.22 25 / 0.12)", text: "oklch(0.6 0.22 25)" },
  partial: { bg: "oklch(0.73 0.16 65 / 0.12)", text: "oklch(0.73 0.16 65)" },
};

function calcTotal(items: LineItem[]) {
  return items.reduce((sum, i) => sum + i.qty * i.rate, 0);
}

function parsedItems(items: string): LineItem[] {
  try {
    const parsed = JSON.parse(items);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return items
    ? [{ _id: "legacy-0", productName: items, qty: 1, rate: 0 }]
    : [];
}

export default function Billing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);
  const [viewInv, setViewInv] = useState<InvoiceWithId | null>(null);
  const [statusUpdateId, setStatusUpdateId] = useState<bigint | null>(null);
  const [newStatus, setNewStatus] = useState("unpaid" as InvoiceStatus);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const list = await actor!.getAllInvoices();
      return list as unknown as InvoiceWithId[];
    },
    enabled: !!actor,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["invoices"] });

  const updateLineItem = (
    idx: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setForm((f) => {
      const items = [...f.lineItems];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, lineItems: items };
    });
  };

  const addLineItem = () =>
    setForm((f) => ({
      ...f,
      lineItems: [
        ...f.lineItems,
        {
          _id: `li-${Date.now()}-${Math.random()}`,
          productName: "",
          qty: 1,
          rate: 0,
        },
      ],
    }));

  const removeLineItem = (idx: number) =>
    setForm((f) => ({
      ...f,
      lineItems: f.lineItems.filter((_, i) => i !== idx),
    }));

  const handleSave = async () => {
    if (!actor || !form.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (
      form.lineItems.length === 0 ||
      form.lineItems.every((i) => !i.productName.trim())
    ) {
      toast.error("Add at least one item");
      return;
    }
    setSaving(true);
    const total = calcTotal(form.lineItems);
    try {
      await actor.createInvoice({
        id: BigInt(0),
        customerName: form.customerName,
        amount: total,
        status: form.status,
        series: form.series || `INV-${Date.now()}`,
        paymentTerms: form.paymentTerms,
        items: JSON.stringify(form.lineItems),
        customerId: BigInt(0),
        date: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Bill created");
      refresh();
      setOpen(false);
      setForm(blankForm());
    } catch {
      toast.error("Failed to create bill");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteInvoice(id);
      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateStatus = async () => {
    if (!actor || statusUpdateId === null) return;
    const inv = invoices.find((i) => i.id === statusUpdateId);
    if (!inv) return;
    try {
      await actor.updateInvoice(statusUpdateId, { ...inv, status: newStatus });
      toast.success("Status updated");
      refresh();
      setStatusUpdateId(null);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.status === "paid" ? inv.amount : 0),
    0,
  );
  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + (inv.status !== "paid" ? inv.amount : 0),
    0,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Create bills and track payments
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
          <Plus className="w-4 h-4" /> Create Bill
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Bills",
            value: invoices.length,
            color: "oklch(0.75 0.13 188)",
          },
          {
            label: "Paid",
            value: invoices.filter((i) => i.status === "paid").length,
            color: "oklch(0.73 0.17 150)",
          },
          {
            label: "Partial",
            value: invoices.filter((i) => i.status === "partial").length,
            color: "oklch(0.73 0.16 65)",
          },
          {
            label: "Unpaid",
            value: invoices.filter((i) => i.status === "unpaid").length,
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
            <p className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs text-muted-custom mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-xl p-5 card-glow"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.015 240), oklch(0.75 0.13 188 / 0.08))",
            border: "1px solid oklch(0.75 0.13 188 / 0.2)",
          }}
        >
          <p className="text-xs text-muted-custom">Revenue Collected</p>
          <p className="text-2xl font-bold text-neon mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="rounded-xl p-5 card-glow"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.015 240), oklch(0.6 0.22 25 / 0.08))",
            border: "1px solid oklch(0.6 0.22 25 / 0.2)",
          }}
        >
          <p className="text-xs text-muted-custom">Outstanding</p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: "oklch(0.6 0.22 25)" }}
          >
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl card-glow overflow-hidden"
        style={{ background: "oklch(0.13 0.015 240)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground">Bills</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-custom text-sm">
            Loading...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <Receipt className="w-10 h-10 text-tertiary" />
            <p className="text-sm text-muted-custom">
              No bills yet — create your first one
            </p>
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
              Create Bill
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.17 0.018 240)" }}>
                  {[
                    "Bill #",
                    "Customer",
                    "Items",
                    "Amount",
                    "Status",
                    "Date",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-tertiary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const sc = statusStyle[inv.status] || statusStyle.unpaid;
                  const dateMs = Number(inv.date) / 1_000_000;
                  const dateStr = new Date(dateMs).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const items = parsedItems(inv.items);
                  return (
                    <tr
                      key={String(inv.id)}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: "oklch(0.17 0.018 240)" }}
                    >
                      <td className="px-5 py-3.5 text-xs font-semibold text-neon">
                        {inv.series || `#${String(inv.id)}`}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-foreground">
                        {inv.customerName}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom">
                        {items.length > 0
                          ? `${items.length} item${items.length > 1 ? "s" : ""}`
                          : "—"}
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs font-bold"
                        style={{ color: "oklch(0.73 0.17 150)" }}
                      >
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusUpdateId(inv.id);
                            setNewStatus(inv.status);
                          }}
                          className="focus:outline-none"
                        >
                          <Badge
                            className="text-[10px] font-semibold border-0 capitalize cursor-pointer hover:opacity-80"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {inv.status}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom">
                        {dateStr}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewInv(inv)}
                            className="p-1.5 rounded text-tertiary hover:text-neon transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(inv.id)}
                            className="p-1.5 rounded text-tertiary hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create Bill Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
            maxWidth: "540px",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
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
                <Label className="text-xs text-muted-custom">
                  Bill / Invoice No.
                </Label>
                <Input
                  value={form.series}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, series: e.target.value }))
                  }
                  placeholder="e.g. INV-1001"
                  className="bg-transparent border-white/10 text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-custom">Line Items</Label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-xs text-neon hover:underline"
                >
                  + Add Item
                </button>
              </div>
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid oklch(0.21 0.02 240)" }}
              >
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "oklch(0.10 0.012 240)" }}>
                      <th className="text-left px-3 py-2 text-[10px] text-tertiary">
                        Product/Item
                      </th>
                      <th className="text-center px-2 py-2 text-[10px] text-tertiary w-16">
                        Qty
                      </th>
                      <th className="text-center px-2 py-2 text-[10px] text-tertiary w-20">
                        Rate (₹)
                      </th>
                      <th className="text-right px-3 py-2 text-[10px] text-tertiary w-20">
                        Amt (₹)
                      </th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {form.lineItems.map((item, idx) => (
                      <tr
                        key={item._id}
                        style={{ borderTop: "1px solid oklch(0.17 0.018 240)" }}
                      >
                        <td className="px-2 py-1.5">
                          <Input
                            value={item.productName}
                            onChange={(e) =>
                              updateLineItem(idx, "productName", e.target.value)
                            }
                            placeholder="e.g. 20L Jars"
                            className="bg-transparent border-transparent text-foreground text-xs h-7 px-1"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <Input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              updateLineItem(idx, "qty", Number(e.target.value))
                            }
                            className="bg-transparent border-transparent text-foreground text-xs h-7 px-1 text-center"
                            min={1}
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateLineItem(
                                idx,
                                "rate",
                                Number(e.target.value),
                              )
                            }
                            className="bg-transparent border-transparent text-foreground text-xs h-7 px-1 text-center"
                            min={0}
                          />
                        </td>
                        <td
                          className="px-2 py-1.5 text-right text-xs font-semibold"
                          style={{ color: "oklch(0.73 0.17 150)" }}
                        >
                          ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                        </td>
                        <td className="px-1">
                          {form.lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              className="text-tertiary hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr
                      style={{
                        borderTop: "1px solid oklch(0.21 0.02 240)",
                        background: "oklch(0.10 0.012 240)",
                      }}
                    >
                      <td
                        colSpan={3}
                        className="px-3 py-2 text-xs font-bold text-foreground text-right"
                      >
                        TOTAL
                      </td>
                      <td className="px-2 py-2 text-right text-sm font-bold text-neon">
                        ₹{calcTotal(form.lineItems).toLocaleString("en-IN")}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as InvoiceStatus }))
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
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">
                  Payment Terms
                </Label>
                <Input
                  value={form.paymentTerms}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentTerms: e.target.value }))
                  }
                  placeholder="COD, Net 30"
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
                {saving ? "Saving..." : "Create Bill"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Bill Modal */}
      <Dialog open={!!viewInv} onOpenChange={() => setViewInv(null)}>
        <DialogContent
          style={{ background: "#fff", color: "#000", maxWidth: "480px" }}
          className="text-black"
        >
          <div id="bill-print">
            <div className="text-center pb-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-blue-900">
                Sidhivinayak Waters
              </h1>
              <p className="text-sm text-gray-500">FactoryOS • Official Bill</p>
            </div>
            {viewInv && (
              <div className="pt-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Bill To</p>
                    <p className="font-bold">{viewInv.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Bill No.</p>
                    <p className="font-bold">
                      {viewInv.series || `#${String(viewInv.id)}`}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(
                        Number(viewInv.date) / 1_000_000,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <table className="w-full text-sm border border-gray-200 rounded">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="text-left px-3 py-2 text-xs">Item</th>
                      <th className="text-center px-2 py-2 text-xs">Qty</th>
                      <th className="text-center px-2 py-2 text-xs">Rate</th>
                      <th className="text-right px-3 py-2 text-xs">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems(viewInv.items).map((item, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static bill view list
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-2">{item.productName || "—"}</td>
                        <td className="px-2 py-2 text-center">{item.qty}</td>
                        <td className="px-2 py-2 text-center">₹{item.rate}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td
                        colSpan={3}
                        className="px-3 py-2 font-bold text-right"
                      >
                        TOTAL
                      </td>
                      <td className="px-3 py-2 font-bold text-right text-blue-900">
                        ₹{viewInv.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {viewInv.paymentTerms && (
                  <p className="text-xs text-gray-500">
                    Payment Terms: {viewInv.paymentTerms}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setViewInv(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    className="flex-1 bg-blue-900 text-white hover:bg-blue-800"
                  >
                    🖨 Print Bill
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusUpdateId !== null}
        onOpenChange={() => setStatusUpdateId(null)}
      >
        <DialogContent
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
            maxWidth: "320px",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Update Payment Status
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as InvoiceStatus)}
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
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-muted-custom"
                onClick={() => setStatusUpdateId(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                className="flex-1"
                style={{
                  background: "oklch(0.75 0.13 188 / 0.2)",
                  border: "1px solid oklch(0.75 0.13 188 / 0.5)",
                  color: "oklch(0.75 0.13 188)",
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
