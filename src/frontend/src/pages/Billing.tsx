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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Eye, Plus, Receipt, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Invoice, InvoiceStatus } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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

// Candid variant helpers — Motoko variants serialize as { paid: null } objects
const toVariantStatus = (s: string) =>
  ({ [s]: null }) as unknown as InvoiceStatus;
const fromVariantStatus = (v: InvoiceStatus): string => {
  if (typeof v === "string") return v; // fallback if already a string
  return Object.keys(v as unknown as object)[0] ?? "unpaid";
};
const normalizeInvoice = (inv: InvoiceWithId): InvoiceWithId => ({
  ...inv,
  status: fromVariantStatus(inv.status) as unknown as InvoiceStatus,
});

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

function buildShareText(inv: InvoiceWithId): string {
  const dateStr = new Date(Number(inv.date) / 1_000_000).toLocaleDateString(
    "en-IN",
    { day: "2-digit", month: "short", year: "numeric" },
  );
  const items = parsedItems(inv.items);
  const itemLines = items
    .map(
      (it) =>
        `  • ${it.productName} — Qty: ${it.qty} × ₹${it.rate} = ₹${(it.qty * it.rate).toLocaleString("en-IN")}`,
    )
    .join("\n");
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "      SIDHIVINAYAK WATERS",
    "  Premium Packaged Drinking Water",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `Bill No : ${inv.series || `#${String(inv.id)}`}`,
    `Date    : ${dateStr}`,
    `Customer: ${inv.customerName}`,
    `Status  : ${String(inv.status).toUpperCase()}`,
    inv.paymentTerms ? `Terms   : ${inv.paymentTerms}` : "",
    "──────────────────────────────",
    "ITEMS:",
    itemLines,
    "──────────────────────────────",
    `TOTAL   : ₹${inv.amount.toLocaleString("en-IN")}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Thank you for your business!",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export default function Billing() {
  const { actor, isFetching } = useActor();
  const { identity, login, isLoggingIn } = useInternetIdentity() as any;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);
  const [viewInv, setViewInv] = useState<InvoiceWithId | null>(null);
  const [statusUpdateId, setStatusUpdateId] = useState<bigint | null>(null);
  const [newStatus, setNewStatus] = useState("unpaid" as InvoiceStatus);
  const customerNameRef = useRef<HTMLInputElement>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const list = await actor!.getAllInvoices();
      return (list as unknown as InvoiceWithId[]).map(normalizeInvoice);
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
    if (!actor) {
      toast.error("Still loading, please wait...");
      return;
    }
    const customerNameValue =
      customerNameRef.current?.value?.trim() || form.customerName.trim();
    if (!customerNameValue) {
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
        customerName: customerNameValue,
        amount: total,
        status: toVariantStatus(form.status as unknown as string),
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
      await actor.updateInvoice(statusUpdateId, {
        ...inv,
        status: toVariantStatus(newStatus as unknown as string),
      });
      toast.success("Status updated");
      refresh();
      setStatusUpdateId(null);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleShareBill = async (inv: InvoiceWithId) => {
    const text = buildShareText(inv);
    const title = "Bill - Sidhivinayak Waters";
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
      } catch {
        // user cancelled or share failed — silently ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Bill details copied!");
      } catch {
        toast.error("Could not copy to clipboard");
      }
    }
  };

  const handleWhatsAppShare = (inv: InvoiceWithId) => {
    const dateStr = new Date(Number(inv.date) / 1_000_000).toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "short", year: "numeric" },
    );
    const items = parsedItems(inv.items);
    const itemLines = items
      .map(
        (it) =>
          `• ${it.productName} x${it.qty} @ ₹${it.rate} = ₹${(it.qty * it.rate).toLocaleString("en-IN")}`,
      )
      .join("\n");
    const gst = Math.round(inv.amount * 0.18);
    const subtotal = inv.amount - gst;
    const text = [
      "*SIDHIVINAYAK WATERS*",
      `Invoice #${inv.series || String(inv.id)}`,
      `Date: ${dateStr}`,
      `Customer: ${inv.customerName}`,
      "",
      "Items:",
      itemLines,
      "",
      `Subtotal: ₹${subtotal.toLocaleString("en-IN")}`,
      `GST (18%): ₹${gst.toLocaleString("en-IN")}`,
      `*Total: ₹${inv.amount.toLocaleString("en-IN")}*`,
      "",
      `Status: ${String(inv.status).toUpperCase()}`,
      "",
      "Thank you for your business!",
      "Sidhivinayak Waters",
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownloadPDF = async (_inv: InvoiceWithId) => {
    const billEl = document.getElementById("bill-print");
    if (!billEl) return;
    try {
      toast.info("Generating PDF...");
      const canvas = await html2canvas(billEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let imgW = pageW - 20;
      let imgH = imgW / ratio;
      if (imgH > pageH - 20) {
        imgH = pageH - 20;
        imgW = imgH * ratio;
      }
      pdf.addImage(imgData, "PNG", (pageW - imgW) / 2, 10, imgW, imgH);
      pdf.save(`Bill-${_inv.customerName}-${_inv.series || _inv.id}.pdf`);
      toast.success("PDF saved!");
    } catch {
      toast.error("PDF generation failed");
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

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6">
        <div className="text-6xl">🧾</div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Billing</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Login with Internet Identity to create and manage bills
          </p>
          <button
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: "oklch(0.75 0.13 188)",
              color: "oklch(0.10 0.012 240)",
              boxShadow: "0 0 16px oklch(0.75 0.13 188 / 0.4)",
            }}
          >
            {isLoggingIn ? "Logging in..." : "Login to Continue"}
          </button>
        </div>
      </div>
    );
  }

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
                  ref={customerNameRef}
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerName: e.target.value }))
                  }
                  onInput={(e) =>
                    setForm((f) => ({
                      ...f,
                      customerName: (e.target as HTMLInputElement).value,
                    }))
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
                disabled={saving || !actor}
                onClick={handleSave}
                className="flex-1"
                style={{
                  background: "oklch(0.75 0.13 188 / 0.2)",
                  border: "1px solid oklch(0.75 0.13 188 / 0.5)",
                  color: "oklch(0.75 0.13 188)",
                }}
              >
                {saving
                  ? "Saving..."
                  : !actor && isFetching
                    ? "Loading..."
                    : "Create Bill"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Bill Modal */}
      <Dialog open={!!viewInv} onOpenChange={() => setViewInv(null)}>
        <DialogContent
          style={{
            background: "#ffffff",
            color: "#111",
            maxWidth: "520px",
            padding: 0,
            overflow: "hidden",
          }}
          className="text-black p-0"
        >
          {/* Print styles injected inline */}
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #bill-print, #bill-print * { visibility: visible !important; }
              #bill-print position: fixed; inset: 0; padding: 32px; 
              #bill-no-print display: none !important; 
            }
          `}</style>

          {viewInv && (
            <>
              {/* Printable area */}
              <div
                id="bill-print"
                style={{ background: "#fff", padding: "28px 28px 20px" }}
              >
                {/* Company header */}
                <div
                  style={{
                    borderBottom: "2px solid #0A1F44",
                    paddingBottom: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h1
                        style={{
                          fontSize: "22px",
                          fontWeight: 800,
                          color: "#0A1F44",
                          margin: 0,
                          letterSpacing: "-0.3px",
                        }}
                      >
                        Sidhivinayak Waters
                      </h1>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#555",
                          margin: "2px 0 0",
                          fontWeight: 500,
                        }}
                      >
                        Premium Packaged Drinking Water
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          margin: "6px 0 0",
                        }}
                      >
                        Factory Address: Maharashtra, India
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          margin: "2px 0 0",
                        }}
                      >
                        Phone: +91 XXXXXXXXXX
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          margin: "2px 0 0",
                        }}
                      >
                        GSTIN: XXXXXXXXXXXX
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "#0A1F44",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 12px",
                          borderRadius: "4px",
                          letterSpacing: "1px",
                        }}
                      >
                        TAX INVOICE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bill To + Bill Details */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#888",
                        margin: "0 0 3px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Bill To
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#0A1F44",
                        margin: 0,
                      }}
                    >
                      {viewInv.customerName}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <table
                      style={{
                        fontSize: "11px",
                        color: "#555",
                        borderCollapse: "collapse",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td style={{ paddingRight: "10px", color: "#888" }}>
                            Bill No.
                          </td>
                          <td style={{ fontWeight: 700, color: "#0A1F44" }}>
                            {viewInv.series || `#${String(viewInv.id)}`}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingRight: "10px", color: "#888" }}>
                            Date
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {new Date(
                              Number(viewInv.date) / 1_000_000,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                        {viewInv.paymentTerms && (
                          <tr>
                            <td style={{ paddingRight: "10px", color: "#888" }}>
                              Terms
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {viewInv.paymentTerms}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td style={{ paddingRight: "10px", color: "#888" }}>
                            Status
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "1px 8px",
                                borderRadius: "999px",
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "capitalize",
                                background:
                                  String(viewInv.status) === "paid"
                                    ? "#d1fae5"
                                    : String(viewInv.status) === "partial"
                                      ? "#fef3c7"
                                      : "#fee2e2",
                                color:
                                  String(viewInv.status) === "paid"
                                    ? "#065f46"
                                    : String(viewInv.status) === "partial"
                                      ? "#92400e"
                                      : "#991b1b",
                              }}
                            >
                              {String(viewInv.status)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Items Table */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#0A1F44" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "11px",
                        }}
                      >
                        Item
                      </th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "8px 8px",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "11px",
                          width: "56px",
                        }}
                      >
                        Qty
                      </th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "8px 8px",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "11px",
                          width: "80px",
                        }}
                      >
                        Rate (₹)
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "8px 12px",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "11px",
                          width: "90px",
                        }}
                      >
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems(viewInv.items).map((item, i) => (
                      <tr
                        key={item._id}
                        style={{
                          background: i % 2 === 0 ? "#f8fafc" : "#fff",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <td style={{ padding: "8px 12px", color: "#1e293b" }}>
                          {item.productName || "—"}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            color: "#334155",
                          }}
                        >
                          {item.qty}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            color: "#334155",
                          }}
                        >
                          ₹{item.rate.toLocaleString("en-IN")}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    <tr
                      style={{
                        background: "#eff6ff",
                        borderTop: "2px solid #0A1F44",
                      }}
                    >
                      <td
                        colSpan={3}
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontWeight: 800,
                          fontSize: "13px",
                          color: "#0A1F44",
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontWeight: 800,
                          fontSize: "14px",
                          color: "#0A1F44",
                        }}
                      >
                        ₹{viewInv.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer */}
                <div
                  style={{
                    marginTop: "20px",
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontStyle: "italic",
                      margin: 0,
                    }}
                  >
                    Thank you for your business!
                  </p>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#94a3b8",
                        margin: "0 0 18px",
                      }}
                    >
                      Authorized Signatory
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#0A1F44",
                        margin: 0,
                        borderTop: "1px solid #0A1F44",
                        paddingTop: "4px",
                      }}
                    >
                      Sidhivinayak Waters
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons — hidden on print */}
              <div
                id="bill-no-print"
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "14px 28px 20px",
                  background: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewInv(null)}
                  style={{
                    flex: 1,
                    padding: "9px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(viewInv!)}
                  style={{
                    flex: 1,
                    padding: "9px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#0A1F44",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ⬇ Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleShareBill(viewInv)}
                  style={{
                    flex: 1,
                    padding: "9px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#0ea5e9",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  📤 Share Bill
                </button>
                <button
                  type="button"
                  data-ocid="billing.whatsapp_button"
                  onClick={() => handleWhatsAppShare(viewInv)}
                  style={{
                    flex: 1,
                    padding: "9px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#25D366",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  💬 WhatsApp
                </button>
              </div>
            </>
          )}
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
