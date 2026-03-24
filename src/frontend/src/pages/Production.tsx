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
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Factory,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import QRCodeLib from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BatchStatus, ProductBatch, ProductType, Shift } from "../backend";
import { useActor } from "../hooks/useActor";

type BatchWithId = ProductBatch & { id: bigint };

const blankForm = (): Omit<ProductBatch, "id"> => ({
  status: "scheduled" as BatchStatus,
  date: BigInt(Date.now()) * BigInt(1_000_000),
  shift: "morning" as Shift,
  batchNumber: "",
  quantity: BigInt(0),
  product: "jar20L" as ProductType,
});

const statusColors: Record<string, { bg: string; text: string }> = {
  completed: {
    bg: "oklch(0.73 0.17 150 / 0.12)",
    text: "oklch(0.73 0.17 150)",
  },
  inProgress: {
    bg: "oklch(0.55 0.2 260 / 0.12)",
    text: "oklch(0.65 0.18 250)",
  },
  scheduled: { bg: "oklch(0.73 0.16 65 / 0.12)", text: "oklch(0.73 0.16 65)" },
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  inProgress: "In-Progress",
  scheduled: "Scheduled",
};

const productLabel: Record<string, string> = {
  jar20L: "20L Jars",
  bottle1L: "1L Bottles",
  bottle500ml: "500ml Bottles",
  bottle200ml: "200ml Cups",
};

function formatDate(ms: number) {
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function addOneYear(ms: number) {
  const d = new Date(ms);
  d.setFullYear(d.getFullYear() + 1);
  return d.getTime();
}

function isoDate(ms: number) {
  return new Date(ms).toISOString().split("T")[0];
}

export default function Production() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<ProductBatch, "id">>(blankForm());
  const [batchNumStr, setBatchNumStr] = useState("");
  const [qtyStr, setQtyStr] = useState("");
  const [saving, setSaving] = useState(false);
  const [qrBatch, setQrBatch] = useState<BatchWithId | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const list = await actor!.getAllBatches();
      return list as unknown as BatchWithId[];
    },
    enabled: !!actor,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["batches"] });

  useEffect(() => {
    if (!qrBatch) return;
    const mfgMs = Number(qrBatch.date) / 1_000_000;
    const expMs = addOneYear(mfgMs);
    const data = JSON.stringify({
      company: "Sidhivinayak Waters",
      batch: qrBatch.batchNumber || `BATCH${String(qrBatch.id)}`,
      box: `BOX${String(qrBatch.id).padStart(4, "0")}`,
      mfg: isoDate(mfgMs),
      exp: isoDate(expMs),
      qty: Number(qrBatch.quantity),
    });
    QRCodeLib.toDataURL(data, {
      width: 220,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [qrBatch]);

  const openAdd = () => {
    setForm(blankForm());
    setBatchNumStr("");
    setQtyStr("");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    const qty = Number.parseInt(qtyStr, 10);
    if (!qtyStr || Number.isNaN(qty)) {
      toast.error("Enter a valid quantity");
      return;
    }
    setSaving(true);
    try {
      await actor.addProductionBatch({
        ...form,
        id: BigInt(0),
        batchNumber: batchNumStr,
        quantity: BigInt(qty),
        date: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Batch added");
      refresh();
      setOpen(false);
    } catch {
      toast.error("Failed to add batch");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteBatch(id);
      toast.success("Batch deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const completed = batches.filter((b) => b.status === "completed").length;
  const inProgress = batches.filter((b) => b.status === "inProgress").length;
  const scheduled = batches.filter((b) => b.status === "scheduled").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Production</h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Production batches &amp; shift overview
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{
            background: "oklch(0.75 0.13 188 / 0.15)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
            color: "oklch(0.75 0.13 188)",
          }}
        >
          <Plus className="w-4 h-4" /> Add Batch
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Completed",
            count: completed,
            icon: CheckCircle2,
            color: "oklch(0.73 0.17 150)",
          },
          {
            label: "In-Progress",
            count: inProgress,
            icon: Factory,
            color: "oklch(0.65 0.18 250)",
          },
          {
            label: "Scheduled",
            count: scheduled,
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
              className="rounded-xl p-4 card-glow"
              style={{ background: "oklch(0.13 0.015 240)" }}
            >
              <Icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
              <p className="text-2xl font-bold text-foreground">{s.count}</p>
              <p className="text-xs text-muted-custom">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl card-glow overflow-hidden"
        style={{ background: "oklch(0.13 0.015 240)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <h2 className="text-base font-semibold text-foreground">
            Production Batches
          </h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-custom text-sm">
            Loading...
          </div>
        ) : batches.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <Factory className="w-10 h-10 text-tertiary" />
            <p className="text-sm text-muted-custom">
              No batches yet — add your first one
            </p>
            <Button
              onClick={openAdd}
              size="sm"
              style={{
                background: "oklch(0.75 0.13 188 / 0.15)",
                border: "1px solid oklch(0.75 0.13 188 / 0.4)",
                color: "oklch(0.75 0.13 188)",
              }}
            >
              Add Batch
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.17 0.018 240)" }}>
                  {[
                    "Batch #",
                    "Product",
                    "Quantity",
                    "Shift",
                    "Date",
                    "Status",
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
                {batches.map((b) => {
                  const sc = statusColors[b.status] || statusColors.scheduled;
                  const dateMs = Number(b.date) / 1_000_000;
                  const dateStr = new Date(dateMs).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <tr
                      key={String(b.id)}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: "oklch(0.17 0.018 240)" }}
                    >
                      <td className="px-5 py-3.5 text-xs font-semibold text-neon">
                        {b.batchNumber || `#${String(b.id)}`}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-foreground">
                        {productLabel[b.product] || b.product}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom">
                        {Number(b.quantity).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom capitalize">
                        {b.shift}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {dateStr}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className="text-[10px] font-semibold border-0"
                          style={{ background: sc.bg, color: sc.text }}
                        >
                          {statusLabel[b.status] || b.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setQrBatch(b)}
                            className="p-1.5 rounded text-tertiary hover:text-neon transition-colors"
                            title="Show QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
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

      {/* Add Batch Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Production Batch
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Batch Number</Label>
              <Input
                value={batchNumStr}
                onChange={(e) => setBatchNumStr(e.target.value)}
                placeholder="e.g. B20260324A"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <Label className="text-xs text-muted-custom">Quantity *</Label>
                <Input
                  type="number"
                  value={qtyStr}
                  onChange={(e) => setQtyStr(e.target.value)}
                  placeholder="e.g. 12500"
                  className="bg-transparent border-white/10 text-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">Shift</Label>
                <Select
                  value={form.shift}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, shift: v as Shift }))
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
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as BatchStatus }))
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="inProgress">In-Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
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
                {saving ? "Saving..." : "Add Batch"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!qrBatch} onOpenChange={() => setQrBatch(null)}>
        <DialogContent
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
            maxWidth: "340px",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-neon">Batch QR Code</DialogTitle>
          </DialogHeader>
          {qrBatch && (
            <div className="flex flex-col items-center gap-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="rounded-lg"
                  style={{ width: 220, height: 220 }}
                />
              ) : (
                <div className="w-[220px] h-[220px] rounded-lg bg-white/5 flex items-center justify-center text-tertiary text-sm">
                  Generating...
                </div>
              )}
              <div
                className="w-full text-center space-y-0.5 py-3 px-4 rounded-lg"
                style={{
                  background: "oklch(0.10 0.012 240)",
                  border: "1px solid oklch(0.21 0.02 240)",
                  fontFamily: "monospace",
                }}
              >
                <p className="text-sm font-bold text-neon">
                  Sidhivinayak Waters
                </p>
                <p className="text-xs text-muted-custom">
                  Batch: {qrBatch.batchNumber || `BATCH${String(qrBatch.id)}`}
                </p>
                <p className="text-xs text-muted-custom">
                  Box No: BOX{String(qrBatch.id).padStart(4, "0")}
                </p>
                <p className="text-xs text-muted-custom">
                  MFG: {formatDate(Number(qrBatch.date) / 1_000_000)}
                </p>
                <p className="text-xs text-muted-custom">
                  EXP:{" "}
                  {formatDate(addOneYear(Number(qrBatch.date) / 1_000_000))}
                </p>
                <p className="text-xs text-muted-custom">
                  Qty: {Number(qrBatch.quantity).toLocaleString()} units
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 text-muted-custom"
                  onClick={() => setQrBatch(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="flex-1"
                  style={{
                    background: "oklch(0.75 0.13 188 / 0.2)",
                    border: "1px solid oklch(0.75 0.13 188 / 0.5)",
                    color: "oklch(0.75 0.13 188)",
                  }}
                >
                  🖨 Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
