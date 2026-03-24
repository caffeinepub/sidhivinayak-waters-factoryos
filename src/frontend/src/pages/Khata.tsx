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
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { KhataEntry, KhataEntryType, Shop } from "../backend";
import { useActor } from "../hooks/useActor";

type KhataWithId = KhataEntry & { id: bigint };
type ShopWithId = Shop & { id: bigint };

const blankForm = () => ({
  shopId: "",
  entryType: "debit" as KhataEntryType,
  amount: "",
  description: "",
});

export default function Khata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);
  const [filterShopId, setFilterShopId] = useState<string>("all");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["khata"],
    queryFn: async () => {
      const list = await actor!.getAllKhataEntries();
      return list as unknown as KhataWithId[];
    },
    enabled: !!actor,
  });

  const { data: shops = [] } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const list = await actor!.getAllShops();
      return list as unknown as ShopWithId[];
    },
    enabled: !!actor,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["khata"] });

  const filteredEntries = useMemo(() => {
    if (filterShopId === "all") return entries;
    return entries.filter((e) => String(e.shopId) === filterShopId);
  }, [entries, filterShopId]);

  const shopBalance = useMemo(() => {
    const e = filterShopId === "all" ? entries : filteredEntries;
    return e.reduce((sum, entry) => {
      return (
        sum + (entry.entryType === "credit" ? entry.amount : -entry.amount)
      );
    }, 0);
  }, [entries, filteredEntries, filterShopId]);

  const totalOutstanding = useMemo(() => {
    return entries.reduce(
      (sum, e) => sum + (e.entryType === "credit" ? e.amount : -e.amount),
      0,
    );
  }, [entries]);

  const handleSave = async () => {
    if (!actor || !form.shopId || !form.amount) {
      toast.error("Shop and amount are required");
      return;
    }
    const amount = Number.parseFloat(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const shop = shops.find((s) => String(s.id) === form.shopId);
    setSaving(true);
    try {
      await actor.addKhataEntry({
        id: BigInt(0),
        shopId: BigInt(form.shopId),
        shopName: shop?.name || "",
        entryType: form.entryType,
        amount,
        description: form.description,
        date: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Entry added");
      refresh();
      setOpen(false);
      setForm(blankForm());
    } catch {
      toast.error("Failed to add entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteKhataEntry(id);
      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Khata</h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Shop ledger — credit &amp; debit records
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
          <Plus className="w-4 h-4" /> Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 card-glow"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <p className="text-xs text-muted-custom">Total Outstanding</p>
          <p
            className="text-2xl font-bold mt-1"
            style={{
              color:
                totalOutstanding >= 0
                  ? "oklch(0.73 0.17 150)"
                  : "oklch(0.6 0.22 25)",
            }}
          >
            ₹{Math.abs(totalOutstanding).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-tertiary mt-0.5">
            {totalOutstanding >= 0 ? "Receivable" : "Payable"}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="rounded-xl p-4 card-glow"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <p className="text-xs text-muted-custom">Total Entries</p>
          <p className="text-2xl font-bold text-neon mt-1">{entries.length}</p>
          <p className="text-[10px] text-tertiary mt-0.5">
            {shops.length} shops
          </p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterShopId} onValueChange={setFilterShopId}>
          <SelectTrigger className="w-48 bg-transparent border-white/10 text-foreground text-sm">
            <SelectValue placeholder="All Shops" />
          </SelectTrigger>
          <SelectContent
            style={{
              background: "oklch(0.13 0.015 240)",
              border: "1px solid oklch(0.21 0.02 240)",
            }}
          >
            <SelectItem value="all">All Shops</SelectItem>
            {shops.map((s) => (
              <SelectItem key={String(s.id)} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filterShopId !== "all" && (
          <div
            className="rounded-lg px-3 py-2"
            style={{
              background: "oklch(0.13 0.015 240)",
              border: "1px solid oklch(0.21 0.02 240)",
            }}
          >
            <span className="text-xs text-muted-custom">Balance: </span>
            <span
              className="text-sm font-bold"
              style={{
                color:
                  shopBalance >= 0
                    ? "oklch(0.73 0.17 150)"
                    : "oklch(0.6 0.22 25)",
              }}
            >
              ₹{Math.abs(shopBalance).toLocaleString("en-IN")}{" "}
              {shopBalance >= 0 ? "↑ receivable" : "↓ payable"}
            </span>
          </div>
        )}
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
            Ledger Entries
          </h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-custom text-sm">
            Loading...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <BookOpen className="w-10 h-10 text-tertiary" />
            <p className="text-sm text-muted-custom">No entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.17 0.018 240)" }}>
                  {["Date", "Shop", "Description", "Type", "Amount", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-tertiary"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const dateMs = Number(entry.date) / 1_000_000;
                  const dateStr = new Date(dateMs).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const isCredit = entry.entryType === "credit";
                  return (
                    <tr
                      key={String(entry.id)}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: "oklch(0.17 0.018 240)" }}
                    >
                      <td className="px-5 py-3.5 text-xs text-muted-custom">
                        {dateStr}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-foreground">
                        {entry.shopName || `Shop #${String(entry.shopId)}`}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom max-w-[180px] truncate">
                        {entry.description || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className="text-[10px] font-semibold border-0 capitalize"
                          style={{
                            background: isCredit
                              ? "oklch(0.73 0.17 150 / 0.12)"
                              : "oklch(0.6 0.22 25 / 0.12)",
                            color: isCredit
                              ? "oklch(0.73 0.17 150)"
                              : "oklch(0.6 0.22 25)",
                          }}
                        >
                          {entry.entryType}
                        </Badge>
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs font-bold"
                        style={{
                          color: isCredit
                            ? "oklch(0.73 0.17 150)"
                            : "oklch(0.6 0.22 25)",
                        }}
                      >
                        {isCredit ? "+" : "-"}₹
                        {entry.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
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
            <DialogTitle className="text-foreground">
              Add Khata Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Shop *</Label>
              <Select
                value={form.shopId}
                onValueChange={(v) => setForm((f) => ({ ...f, shopId: v }))}
              >
                <SelectTrigger className="bg-transparent border-white/10 text-foreground">
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.13 0.015 240)",
                    border: "1px solid oklch(0.21 0.02 240)",
                  }}
                >
                  {shops.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">Type</Label>
                <Select
                  value={form.entryType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, entryType: v as KhataEntryType }))
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
                    <SelectItem value="credit">Credit (they owe us)</SelectItem>
                    <SelectItem value="debit">Debit (we owe them)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">
                  Amount (₹) *
                </Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="e.g. 5000"
                  className="bg-transparent border-white/10 text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">
                Description / Note
              </Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="e.g. Delivered 50 jars"
                className="bg-transparent border-white/10 text-foreground"
              />
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
                {saving ? "Saving..." : "Add Entry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
