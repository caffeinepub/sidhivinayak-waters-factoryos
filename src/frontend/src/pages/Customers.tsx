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
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Customer, CustomerType } from "../backend";
import { useActor } from "../hooks/useActor";

type CustomerWithId = Customer & { id: bigint };

const blankForm = (): Customer => ({
  name: "",
  phone: "",
  email: "",
  address: "",
  customerType: "retail" as CustomerType,
});

const typeColors: Record<string, { bg: string; text: string }> = {
  retail: { bg: "oklch(0.55 0.2 260 / 0.12)", text: "oklch(0.65 0.18 250)" },
  wholesale: {
    bg: "oklch(0.75 0.13 188 / 0.12)",
    text: "oklch(0.75 0.13 188)",
  },
  hotel: { bg: "oklch(0.73 0.16 65 / 0.12)", text: "oklch(0.73 0.16 65)" },
};

export default function Customers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState<Customer>(blankForm());
  const [saving, setSaving] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const list = await actor!.getAllCustomers();
      return list as unknown as CustomerWithId[];
    },
    enabled: !!actor,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["customers"] });

  const openAdd = () => {
    setEditId(null);
    setForm(blankForm());
    setOpen(true);
  };

  const openEdit = (c: CustomerWithId) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      customerType: c.customerType,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!actor || !form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editId !== null) {
        await actor.updateCustomer(editId, form);
        toast.success("Customer updated");
      } else {
        await actor.addCustomer(form);
        toast.success("Customer added");
      }
      refresh();
      setOpen(false);
    } catch (_e) {
      toast.error("Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.deleteCustomer(id);
      toast.success("Customer deleted");
      refresh();
    } catch (_e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Manage your customer directory
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
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: customers.length,
            color: "oklch(0.75 0.13 188)",
          },
          {
            label: "Retail",
            value: customers.filter((c) => c.customerType === "retail").length,
            color: "oklch(0.65 0.18 250)",
          },
          {
            label: "Wholesale",
            value: customers.filter((c) => c.customerType === "wholesale")
              .length,
            color: "oklch(0.73 0.17 150)",
          },
          {
            label: "Hotel",
            value: customers.filter((c) => c.customerType === "hotel").length,
            color: "oklch(0.73 0.16 65)",
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
            Customer List
          </h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-custom text-sm">
            Loading...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <Users className="w-10 h-10 text-tertiary" />
            <p className="text-sm text-muted-custom">
              No customers yet — add your first one
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
              Add Customer
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.17 0.018 240)" }}>
                  {["Name", "Phone", "Email", "Address", "Type", "Actions"].map(
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
                {customers.map((c) => {
                  const tc = typeColors[c.customerType] || typeColors.retail;
                  return (
                    <tr
                      key={String(c.id)}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: "oklch(0.17 0.018 240)" }}
                    >
                      <td className="px-5 py-3.5 text-xs font-semibold text-foreground">
                        {c.name}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom">
                        {c.phone}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom">
                        {c.email || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-custom max-w-[180px] truncate">
                        {c.address || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className="text-[10px] font-semibold border-0 capitalize"
                          style={{ background: tc.bg, color: tc.text }}
                        >
                          {c.customerType}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded text-tertiary hover:text-neon transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editId !== null ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Customer name"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
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
              <Label className="text-xs text-muted-custom">Email</Label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="Email address"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Address</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Full address"
                className="bg-transparent border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-custom">Customer Type</Label>
              <Select
                value={form.customerType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, customerType: v as CustomerType }))
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
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
