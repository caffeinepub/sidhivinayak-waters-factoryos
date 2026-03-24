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
import { MapPin, Pencil, Phone, Plus, Store, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { CustomerType, Shop } from "../backend";
import { useActor } from "../hooks/useActor";

type ShopWithId = Shop & { id: bigint };

const blankForm = () => ({
  name: "",
  phone: "",
  location: "",
  address: "",
  contactPerson: "",
  shopType: "retail" as CustomerType,
});

const typeColors: Record<string, { bg: string; text: string }> = {
  retail: { bg: "oklch(0.75 0.13 188 / 0.12)", text: "oklch(0.75 0.13 188)" },
  wholesale: {
    bg: "oklch(0.73 0.17 150 / 0.12)",
    text: "oklch(0.73 0.17 150)",
  },
  hotel: { bg: "oklch(0.73 0.16 65 / 0.12)", text: "oklch(0.73 0.16 65)" },
};

export default function Shops() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [editId, setEditId] = useState<bigint | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<bigint | null>(null);
  const [shopBalances, setShopBalances] = useState<Record<string, number>>({});

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const list = await actor!.getAllShops();
      return list as unknown as ShopWithId[];
    },
    enabled: !!actor,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["shops"] });

  const loadBalance = async (shopId: bigint) => {
    if (!actor) return;
    const key = String(shopId);
    if (shopBalances[key] !== undefined) return;
    try {
      const bal = await actor.getShopBalance(shopId);
      setShopBalances((prev) => ({ ...prev, [key]: bal }));
    } catch {}
  };

  const handleExpand = async (id: bigint) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      await loadBalance(id);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm(blankForm());
    setOpen(true);
  };

  const openEdit = (shop: ShopWithId) => {
    setEditId(shop.id);
    setForm({
      name: shop.name,
      phone: shop.phone,
      location: shop.location,
      address: shop.address,
      contactPerson: shop.contactPerson,
      shopType: shop.shopType,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!actor || !form.name.trim()) {
      toast.error("Shop name is required");
      return;
    }
    setSaving(true);
    try {
      if (editId !== null) {
        await actor.updateShop(editId, { id: editId, ...form });
        toast.success("Shop updated");
      } else {
        await actor.addShop({ id: BigInt(0), ...form });
        toast.success("Shop added");
      }
      refresh();
      setOpen(false);
    } catch {
      toast.error("Failed to save shop");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteShop(id);
      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const byType = (t: string) => shops.filter((s) => s.shopType === t).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shops</h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Manage shop accounts and balances
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2"
          style={{
            background: "oklch(0.75 0.13 188 / 0.15)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
            color: "oklch(0.75 0.13 188)",
          }}
        >
          <Plus className="w-4 h-4" /> Add Shop
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Shops",
            value: shops.length,
            color: "oklch(0.75 0.13 188)",
          },
          {
            label: "Retail",
            value: byType("retail"),
            color: "oklch(0.75 0.13 188)",
          },
          {
            label: "Wholesale",
            value: byType("wholesale"),
            color: "oklch(0.73 0.17 150)",
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

      {isLoading ? (
        <div className="p-8 text-center text-muted-custom text-sm">
          Loading...
        </div>
      ) : shops.length === 0 ? (
        <div
          className="rounded-xl p-12 flex flex-col items-center gap-3 card-glow"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <Store className="w-10 h-10 text-tertiary" />
          <p className="text-sm text-muted-custom">
            No shops yet — add your first one
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
            Add Shop
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {shops.map((shop, i) => {
            const tc = typeColors[shop.shopType] || typeColors.retail;
            const isExpanded = expandedId === shop.id;
            const balance = shopBalances[String(shop.id)];
            return (
              <motion.div
                key={String(shop.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl card-glow overflow-hidden"
                style={{
                  background: "oklch(0.13 0.015 240)",
                  border: "1px solid oklch(0.21 0.02 240)",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleExpand(shop.id)}
                  className="w-full text-left p-4 flex items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: tc.bg }}
                  >
                    <Store className="w-5 h-5" style={{ color: tc.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">
                        {shop.name}
                      </p>
                      <Badge
                        className="text-[10px] border-0 capitalize"
                        style={{ background: tc.bg, color: tc.text }}
                      >
                        {shop.shopType}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {shop.phone && (
                        <span className="text-xs text-muted-custom flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {shop.phone}
                        </span>
                      )}
                      {shop.location && (
                        <span className="text-xs text-muted-custom flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shop.location}
                        </span>
                      )}
                      {shop.contactPerson && (
                        <span className="text-xs text-muted-custom flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {shop.contactPerson}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(shop);
                      }}
                      className="p-1.5 rounded text-tertiary hover:text-neon transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(shop.id);
                      }}
                      className="p-1.5 rounded text-tertiary hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="px-4 pb-4 border-t"
                    style={{ borderColor: "oklch(0.17 0.018 240)" }}
                  >
                    <div className="pt-3 flex items-center gap-4">
                      <div
                        className="rounded-lg p-3 flex-1"
                        style={{ background: "oklch(0.10 0.012 240)" }}
                      >
                        <p className="text-xs text-muted-custom">
                          Khata Balance
                        </p>
                        <p
                          className="text-lg font-bold mt-0.5"
                          style={{
                            color:
                              balance === undefined
                                ? "oklch(0.5 0 0)"
                                : balance >= 0
                                  ? "oklch(0.73 0.17 150)"
                                  : "oklch(0.6 0.22 25)",
                          }}
                        >
                          {balance === undefined
                            ? "Loading..."
                            : `₹${Math.abs(balance).toLocaleString("en-IN")} ${balance >= 0 ? "(they owe)" : "(we owe)"}`}
                        </p>
                      </div>
                      {shop.address && (
                        <div
                          className="rounded-lg p-3 flex-1"
                          style={{ background: "oklch(0.10 0.012 240)" }}
                        >
                          <p className="text-xs text-muted-custom">Address</p>
                          <p className="text-xs text-foreground mt-0.5">
                            {shop.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editId ? "Edit Shop" : "Add Shop"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">Shop Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Raj Beverages"
                  className="bg-transparent border-white/10 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">Type</Label>
                <Select
                  value={form.shopType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, shopType: v as CustomerType }))
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
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="Phone number"
                  className="bg-transparent border-white/10 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-custom">
                  Contact Person
                </Label>
                <Input
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactPerson: e.target.value }))
                  }
                  placeholder="Owner name"
                  className="bg-transparent border-white/10 text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">
                Location / Area
              </Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g. Andheri West"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Full Address</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Street address"
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
                {saving ? "Saving..." : editId ? "Update" : "Add Shop"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
