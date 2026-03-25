import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Dealer, Document, RawMaterial, StoreInfo } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const statusColor: Record<string, { bg: string; text: string; label: string }> =
  {
    available: {
      bg: "oklch(0.73 0.17 150 / 0.15)",
      text: "oklch(0.73 0.17 150)",
      label: "Available",
    },
    low: {
      bg: "oklch(0.73 0.16 65 / 0.15)",
      text: "oklch(0.73 0.16 65)",
      label: "Low Stock",
    },
    "out of stock": {
      bg: "oklch(0.6 0.22 25 / 0.15)",
      text: "oklch(0.6 0.22 25)",
      label: "Out of Stock",
    },
  };

const blankMaterial = (): Omit<RawMaterial, "id"> => ({
  name: "",
  quantity: 0,
  unit: "",
  status: "available",
  reorderLevel: 0,
  notes: "",
});
const blankDealer = (): Omit<Dealer, "id"> => ({
  name: "",
  company: "",
  phone: "",
  email: "",
  material: "",
  notes: "",
});
const blankDoc = (): Omit<Document, "id" | "createdAt" | "updatedAt"> => ({
  title: "",
  content: "",
});
const blankStore = (): StoreInfo => ({
  storeName: "",
  ownerName: "",
  address: "",
  phone: "",
  email: "",
  gstin: "",
  licenseNo: "",
  mapUrl: "",
});

function StoreTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: info, isLoading } = useQuery({
    queryKey: ["storeInfo"],
    queryFn: async () => (await actor!.getStoreInfo()) as StoreInfo,
    enabled: !!actor,
  });

  const [form, setForm] = useState<StoreInfo>(blankStore());
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  if (info && !initialized) {
    setForm(info);
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      await actor.updateStoreInfo(form);
      qc.invalidateQueries({ queryKey: ["storeInfo"] });
      toast.success("Store info saved!");
    } catch {
      toast.error("Failed to save store info");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading)
    return (
      <div
        data-ocid="store.loading_state"
        className="flex justify-center py-10"
      >
        <Loader2 className="w-5 h-5 text-neon animate-spin" />
      </div>
    );

  const f = (k: keyof StoreInfo, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-tertiary text-xs">Store Name</Label>
          <Input
            data-ocid="store.storeName.input"
            value={form.storeName}
            onChange={(e) => f("storeName", e.target.value)}
            placeholder="Sidhivinayak Waters"
            className="bg-transparent border-border text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-tertiary text-xs">Owner Name</Label>
          <Input
            data-ocid="store.ownerName.input"
            value={form.ownerName}
            onChange={(e) => f("ownerName", e.target.value)}
            placeholder="Owner"
            className="bg-transparent border-border text-foreground"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-tertiary text-xs">Address</Label>
          <Textarea
            data-ocid="store.address.textarea"
            value={form.address}
            onChange={(e) => f("address", e.target.value)}
            placeholder="Factory / Shop address"
            className="bg-transparent border-border text-foreground resize-none"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-tertiary text-xs">Phone</Label>
          <Input
            data-ocid="store.phone.input"
            value={form.phone}
            onChange={(e) => f("phone", e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            className="bg-transparent border-border text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-tertiary text-xs">Email</Label>
          <Input
            data-ocid="store.email.input"
            value={form.email}
            onChange={(e) => f("email", e.target.value)}
            placeholder="info@example.com"
            className="bg-transparent border-border text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-tertiary text-xs">GSTIN</Label>
          <Input
            data-ocid="store.gstin.input"
            value={form.gstin}
            onChange={(e) => f("gstin", e.target.value)}
            placeholder="GSTIN Number"
            className="bg-transparent border-border text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-tertiary text-xs">License No</Label>
          <Input
            data-ocid="store.licenseNo.input"
            value={form.licenseNo}
            onChange={(e) => f("licenseNo", e.target.value)}
            placeholder="License / FSSAI No"
            className="bg-transparent border-border text-foreground"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-tertiary text-xs">Map URL (optional)</Label>
          <Input
            data-ocid="store.mapUrl.input"
            value={form.mapUrl}
            onChange={(e) => f("mapUrl", e.target.value)}
            placeholder="https://maps.google.com/..."
            className="bg-transparent border-border text-foreground"
          />
        </div>
      </div>

      <Button
        data-ocid="store.save_button"
        onClick={handleSave}
        disabled={saving}
        className="w-full"
        style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Store Info
      </Button>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid oklch(0.21 0.02 240)" }}
      >
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            background: "oklch(0.13 0.015 240)",
            borderBottom: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <MapPin className="w-4 h-4 text-neon" />
          <span className="text-sm font-semibold text-foreground">
            Shop Location — Google Maps
          </span>
        </div>
        {form.address ? (
          <iframe
            title="Shop Location"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(form.address)}&output=embed`}
            width="100%"
            height="280"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-40 gap-2"
            style={{ background: "oklch(0.11 0.012 240)" }}
          >
            <MapPin className="w-8 h-8 text-tertiary" />
            <p className="text-sm text-tertiary">
              Add address above to see map
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RawMaterialsTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["rawMaterials"],
    queryFn: async () =>
      (await actor!.getAllRawMaterials()) as unknown as RawMaterial[],
    enabled: !!actor,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [form, setForm] = useState(blankMaterial());
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(blankMaterial());
    setOpen(true);
  };
  const openEdit = (m: RawMaterial) => {
    setEditing(m);
    setForm({
      name: m.name,
      quantity: m.quantity,
      unit: m.unit,
      status: m.status,
      reorderLevel: m.reorderLevel,
      notes: m.notes,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      if (editing) {
        await actor.updateRawMaterial(editing.id, form as RawMaterial);
      } else {
        await actor.addRawMaterial({ id: "", ...form } as RawMaterial);
      }
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
      toast.success(editing ? "Material updated!" : "Material added!");
      setOpen(false);
    } catch {
      toast.error("Failed to save material");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!actor) return;
    try {
      await actor.deleteRawMaterial(id);
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-custom">
          {materials.length} material{materials.length !== 1 ? "s" : ""} tracked
        </p>
        <Button
          data-ocid="rawmaterial.add_button"
          size="sm"
          onClick={openAdd}
          style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Material
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="rawmaterial.loading_state"
          className="flex justify-center py-8"
        >
          <Loader2 className="w-5 h-5 text-neon animate-spin" />
        </div>
      ) : materials.length === 0 ? (
        <div
          data-ocid="rawmaterial.empty_state"
          className="rounded-xl p-8 text-center text-muted-custom"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <Package className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No raw materials added yet</p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="rawmaterial.list">
          {materials.map((m, idx) => {
            const sc =
              statusColor[m.status?.toLowerCase()] ?? statusColor.available;
            return (
              <motion.div
                key={m.id}
                data-ocid={`rawmaterial.item.${idx + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "oklch(0.13 0.015 240)",
                  border: "1px solid oklch(0.21 0.02 240)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-muted-custom mt-0.5">
                    {m.quantity} {m.unit}
                    {m.reorderLevel > 0 && ` · Reorder at ${m.reorderLevel}`}
                  </p>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  {sc.label}
                </span>
                <button
                  type="button"
                  data-ocid={`rawmaterial.edit_button.${idx + 1}`}
                  onClick={() => openEdit(m)}
                  className="text-tertiary hover:text-neon transition-colors text-sm"
                >
                  ✎
                </button>
                <button
                  type="button"
                  data-ocid={`rawmaterial.delete_button.${idx + 1}`}
                  onClick={() => handleDelete(m.id)}
                  className="text-tertiary hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-ocid="rawmaterial.dialog"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? "Edit Material" : "Add Material"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-tertiary text-xs">Name</Label>
              <Input
                data-ocid="rawmaterial.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Water Bottles"
                className="bg-transparent border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-tertiary text-xs">Quantity</Label>
                <Input
                  data-ocid="rawmaterial.quantity.input"
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: Number(e.target.value) }))
                  }
                  className="bg-transparent border-border text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-tertiary text-xs">Unit</Label>
                <Input
                  data-ocid="rawmaterial.unit.input"
                  value={form.unit}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, unit: e.target.value }))
                  }
                  placeholder="kg / pcs / L"
                  className="bg-transparent border-border text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-tertiary text-xs">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger
                  data-ocid="rawmaterial.status.select"
                  className="bg-transparent border-border text-foreground"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.13 0.015 240)",
                    border: "1px solid oklch(0.21 0.02 240)",
                  }}
                >
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out of stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-tertiary text-xs">Reorder Level</Label>
              <Input
                data-ocid="rawmaterial.reorderLevel.input"
                type="number"
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    reorderLevel: Number(e.target.value),
                  }))
                }
                className="bg-transparent border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-tertiary text-xs">Notes</Label>
              <Textarea
                data-ocid="rawmaterial.notes.textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="bg-transparent border-border text-foreground resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button
              data-ocid="rawmaterial.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-muted-custom"
            >
              Cancel
            </Button>
            <Button
              data-ocid="rawmaterial.save_button"
              onClick={handleSave}
              disabled={saving}
              style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DealersTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: dealers = [], isLoading } = useQuery({
    queryKey: ["dealers"],
    queryFn: async () => (await actor!.getAllDealers()) as unknown as Dealer[],
    enabled: !!actor,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dealer | null>(null);
  const [form, setForm] = useState(blankDealer());
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(blankDealer());
    setOpen(true);
  };
  const openEdit = (d: Dealer) => {
    setEditing(d);
    setForm({
      name: d.name,
      company: d.company,
      phone: d.phone,
      email: d.email,
      material: d.material,
      notes: d.notes,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      if (editing) {
        await actor.updateDealer(editing.id, form as Dealer);
      } else {
        await actor.addDealer({ id: "", ...form } as Dealer);
      }
      qc.invalidateQueries({ queryKey: ["dealers"] });
      toast.success(editing ? "Dealer updated!" : "Dealer added!");
      setOpen(false);
    } catch {
      toast.error("Failed to save dealer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!actor) return;
    try {
      await actor.deleteDealer(id);
      qc.invalidateQueries({ queryKey: ["dealers"] });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-custom">
          {dealers.length} dealer{dealers.length !== 1 ? "s" : ""}
        </p>
        <Button
          data-ocid="dealer.add_button"
          size="sm"
          onClick={openAdd}
          style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Dealer
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="dealer.loading_state"
          className="flex justify-center py-8"
        >
          <Loader2 className="w-5 h-5 text-neon animate-spin" />
        </div>
      ) : dealers.length === 0 ? (
        <div
          data-ocid="dealer.empty_state"
          className="rounded-xl p-8 text-center text-muted-custom"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No dealers added yet</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          data-ocid="dealer.list"
        >
          {dealers.map((d, idx) => (
            <motion.div
              key={d.id}
              data-ocid={`dealer.item.${idx + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "oklch(0.13 0.015 240)",
                border: "1px solid oklch(0.21 0.02 240)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-custom">{d.company}</p>
                  {d.material && (
                    <span
                      className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1"
                      style={{
                        background: "oklch(0.75 0.13 188 / 0.12)",
                        color: "oklch(0.75 0.13 188)",
                      }}
                    >
                      {d.material}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    data-ocid={`dealer.edit_button.${idx + 1}`}
                    onClick={() => openEdit(d)}
                    className="text-tertiary hover:text-neon text-sm"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    data-ocid={`dealer.delete_button.${idx + 1}`}
                    onClick={() => handleDelete(d.id)}
                    className="text-tertiary hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {d.phone && (
                  <a
                    href={`tel:${d.phone}`}
                    className="flex items-center gap-2 text-xs text-muted-custom hover:text-neon"
                  >
                    <Phone className="w-3 h-3" /> {d.phone}
                  </a>
                )}
                {d.email && (
                  <a
                    href={`mailto:${d.email}`}
                    className="flex items-center gap-2 text-xs text-muted-custom hover:text-neon"
                  >
                    <Mail className="w-3 h-3" /> {d.email}
                  </a>
                )}
              </div>
              {d.notes && (
                <p className="text-xs text-tertiary italic">{d.notes}</p>
              )}
              {d.phone && (
                <a
                  href={`https://wa.me/${d.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={`dealer.whatsapp_button.${idx + 1}`}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "#25D366", color: "#fff" }}
                >
                  💬 WhatsApp
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-ocid="dealer.dialog"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? "Edit Dealer" : "Add Dealer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(
              [
                ["name", "Name", "text", "Dealer Name"],
                ["company", "Company", "text", "Company / Firm"],
                ["phone", "Phone", "tel", "+91 XXXXX XXXXX"],
                ["email", "Email", "email", "dealer@email.com"],
                ["material", "Material Supplied", "text", "e.g. PET Bottles"],
              ] as const
            ).map(([key, label, type, placeholder]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-tertiary text-xs">{label}</Label>
                <Input
                  data-ocid={`dealer.${key}.input`}
                  type={type}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="bg-transparent border-border text-foreground"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-tertiary text-xs">Notes</Label>
              <Textarea
                data-ocid="dealer.notes.textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="bg-transparent border-border text-foreground resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button
              data-ocid="dealer.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-muted-custom"
            >
              Cancel
            </Button>
            <Button
              data-ocid="dealer.save_button"
              onClick={handleSave}
              disabled={saving}
              style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentsTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () =>
      (await actor!.getAllDocuments()) as unknown as Document[],
    enabled: !!actor,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [form, setForm] = useState(blankDoc());
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [imgPreview, setImgPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(blankDoc());
    setImgPreview("");
    setOpen(true);
  };
  const openEdit = (d: Document) => {
    setEditing(d);
    if (d.content.startsWith("data:image/")) {
      setImgPreview(d.content);
      setForm({ title: d.title, content: "" });
    } else {
      setImgPreview("");
      setForm({ title: d.title, content: d.content });
    }
    setOpen(true);
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      const saveContent = imgPreview || form.content;
      if (editing) {
        await actor.updateDocument(editing.id, {
          ...editing,
          ...form,
          content: saveContent,
        } as Document);
      } else {
        await actor.addDocument({
          id: "",
          ...form,
          content: saveContent,
          createdAt: BigInt(Date.now()) * BigInt(1_000_000),
          updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
        } as Document);
      }
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success(editing ? "Document updated!" : "Document added!");
      setOpen(false);
    } catch {
      toast.error("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!actor) return;
    try {
      await actor.deleteDocument(id);
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-custom">
          {docs.length} document{docs.length !== 1 ? "s" : ""}
        </p>
        <Button
          data-ocid="document.add_button"
          size="sm"
          onClick={openAdd}
          style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Document
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="document.loading_state"
          className="flex justify-center py-8"
        >
          <Loader2 className="w-5 h-5 text-neon animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div
          data-ocid="document.empty_state"
          className="rounded-xl p-8 text-center text-muted-custom"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No documents added yet</p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="document.list">
          {docs.map((d, idx) => {
            const isExp = expanded.has(d.id);
            const dateStr = new Date(
              Number(d.createdAt) / 1_000_000,
            ).toLocaleDateString("en-IN");
            return (
              <motion.div
                key={d.id}
                data-ocid={`document.item.${idx + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "oklch(0.13 0.015 240)",
                  border: "1px solid oklch(0.21 0.02 240)",
                }}
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => toggleExpand(d.id)}
                >
                  {d.content.startsWith("data:image/") ? (
                    <Image className="w-4 h-4 text-neon flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-neon flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {d.title}
                    </p>
                    <p className="text-xs text-tertiary">{dateStr}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-ocid={`document.edit_button.${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(d);
                      }}
                      className="text-tertiary hover:text-neon text-sm"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      data-ocid={`document.delete_button.${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(d.id);
                      }}
                      className="text-tertiary hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExp ? (
                      <ChevronUp className="w-4 h-4 text-tertiary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-tertiary" />
                    )}
                  </div>
                </button>
                {isExp && (
                  <div
                    className="px-4 pb-4"
                    style={{ borderTop: "1px solid oklch(0.21 0.02 240)" }}
                  >
                    {d.content.startsWith("data:image/") ? (
                      <img
                        src={d.content}
                        className="w-full rounded-xl mt-3 max-h-64 object-contain"
                        alt={d.title}
                      />
                    ) : (
                      <p className="text-sm text-muted-custom mt-3 whitespace-pre-wrap">
                        {d.content || "No content"}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-ocid="document.dialog"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? "Edit Document" : "Add Document"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-tertiary text-xs">Title</Label>
              <Input
                data-ocid="document.title.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Document Title"
                className="bg-transparent border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-tertiary text-xs">Content</Label>
              <Textarea
                data-ocid="document.content.textarea"
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="Document content / notes..."
                className="bg-transparent border-border text-foreground resize-none"
                rows={6}
                disabled={!!imgPreview}
                style={
                  imgPreview ? { opacity: 0.4, cursor: "not-allowed" } : {}
                }
              />
            </div>
            <p className="text-xs text-tertiary text-center">— or —</p>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setImgPreview(ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <button
                type="button"
                data-ocid="document.upload_button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 rounded-xl text-sm font-semibold"
                style={{
                  border: "1px solid oklch(0.75 0.13 188)",
                  background: "oklch(0.10 0.015 240)",
                  color: "oklch(0.75 0.13 188)",
                }}
              >
                📷 From Gallery
              </button>
              {imgPreview && (
                <div className="relative">
                  <img
                    src={imgPreview}
                    alt="Preview"
                    className="w-full max-h-40 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImgPreview("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-1 right-1 text-xs bg-black/70 text-red-400 rounded-full px-2 py-0.5"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button
              data-ocid="document.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-muted-custom"
            >
              Cancel
            </Button>
            <Button
              data-ocid="document.save_button"
              onClick={handleSave}
              disabled={saving}
              style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {editing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalculatorTab() {
  const [revenue, setRevenue] = useState({ productSales: 0, otherRevenue: 0 });
  const [expenses, setExpenses] = useState({
    rawMaterials: 0,
    salaries: 0,
    utilities: 0,
    transport: 0,
    marketing: 0,
    other: 0,
  });

  const totalRevenue = revenue.productSales + revenue.otherRevenue;
  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const isProfit = netProfit >= 0;
  const profitColor = isProfit ? "oklch(0.73 0.17 150)" : "oklch(0.6 0.22 25)";
  const profitBg = isProfit
    ? "oklch(0.73 0.17 150 / 0.1)"
    : "oklch(0.6 0.22 25 / 0.1)";

  const handleShare = async () => {
    const lines = [
      "💰 PROFIT SUMMARY — SIDHIVINAYAK WATERS",
      "",
      `Product Sales : ₹${revenue.productSales.toLocaleString("en-IN")}`,
      `Other Revenue : ₹${revenue.otherRevenue.toLocaleString("en-IN")}`,
      `Total Revenue : ₹${totalRevenue.toLocaleString("en-IN")}`,
      "",
      "EXPENSES:",
      `Raw Materials : ₹${expenses.rawMaterials.toLocaleString("en-IN")}`,
      `Salaries      : ₹${expenses.salaries.toLocaleString("en-IN")}`,
      `Utilities     : ₹${expenses.utilities.toLocaleString("en-IN")}`,
      `Transport     : ₹${expenses.transport.toLocaleString("en-IN")}`,
      `Marketing     : ₹${expenses.marketing.toLocaleString("en-IN")}`,
      `Other         : ₹${expenses.other.toLocaleString("en-IN")}`,
      `Total Expenses: ₹${totalExpenses.toLocaleString("en-IN")}`,
      "",
      `NET PROFIT    : ₹${netProfit.toLocaleString("en-IN")}`,
      `PROFIT MARGIN : ${profitMargin.toFixed(2)}%`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Summary copied!");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "oklch(0.13 0.015 240)",
          border: "1px solid oklch(0.75 0.13 188 / 0.3)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "oklch(0.75 0.13 188)" }}
        >
          📈 Revenue
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              ["productSales", "Product Sales (₹)"],
              ["otherRevenue", "Other Revenue (₹)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label className="text-tertiary text-xs">{label}</Label>
              <Input
                data-ocid={`calculator.${key}.input`}
                type="number"
                value={revenue[key] || ""}
                onChange={(e) =>
                  setRevenue((p) => ({ ...p, [key]: Number(e.target.value) }))
                }
                className="bg-transparent border-border text-foreground"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "oklch(0.13 0.015 240)",
          border: "1px solid oklch(0.6 0.22 25 / 0.3)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "oklch(0.6 0.22 25)" }}
        >
          📉 Expenses
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              ["rawMaterials", "Raw Materials (₹)"],
              ["salaries", "Salaries (₹)"],
              ["utilities", "Utilities (₹)"],
              ["transport", "Transport (₹)"],
              ["marketing", "Marketing (₹)"],
              ["other", "Other Expenses (₹)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label className="text-tertiary text-xs">{label}</Label>
              <Input
                data-ocid={`calculator.${key}.input`}
                type="number"
                value={expenses[key] || ""}
                onChange={(e) =>
                  setExpenses((p) => ({ ...p, [key]: Number(e.target.value) }))
                }
                className="bg-transparent border-border text-foreground"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            [
              "Total Revenue",
              `₹${totalRevenue.toLocaleString("en-IN")}`,
              "oklch(0.75 0.13 188)",
              "oklch(0.75 0.13 188 / 0.1)",
            ],
            [
              "Total Expenses",
              `₹${totalExpenses.toLocaleString("en-IN")}`,
              "oklch(0.6 0.22 25)",
              "oklch(0.6 0.22 25 / 0.1)",
            ],
            [
              "Net Profit",
              `₹${netProfit.toLocaleString("en-IN")}`,
              profitColor,
              profitBg,
            ],
            [
              "Profit Margin",
              `${profitMargin.toFixed(1)}%`,
              profitColor,
              profitBg,
            ],
          ] as const
        ).map(([label, value, color, bg]) => (
          <motion.div
            key={label}
            className="rounded-xl p-4"
            style={{ background: bg, border: `1px solid ${color}` }}
            layout
          >
            <p className="text-lg font-bold" style={{ color }}>
              {value}
            </p>
            <p className="text-[11px] text-tertiary mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <Button
        data-ocid="calculator.share_button"
        onClick={handleShare}
        className="w-full"
        style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
      >
        <Share2 className="w-4 h-4 mr-2" /> Copy Summary
      </Button>
    </div>
  );
}

export default function Manager() {
  const { identity, login, isLoggingIn } = useInternetIdentity() as any;

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "oklch(0.75 0.13 188 / 0.12)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
          }}
        >
          <Briefcase className="w-7 h-7 text-neon" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-1">
            Manager Panel
          </h2>
          <p className="text-sm text-muted-custom">
            Login to access manager features
          </p>
        </div>
        <button
          type="button"
          data-ocid="manager.login_button"
          onClick={login}
          disabled={isLoggingIn}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
            </span>
          ) : (
            "Login to Continue"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "oklch(0.75 0.13 188 / 0.12)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
          }}
        >
          <Briefcase className="w-5 h-5 text-neon" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Panel</h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Store info · Raw materials · Dealers · Documents · Profit calculator
          </p>
        </div>
      </div>

      <Tabs defaultValue="store">
        <TabsList
          className="w-full flex overflow-x-auto"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          {(
            [
              ["store", "🏪 Store"],
              ["materials", "📦 Materials"],
              ["dealers", "👥 Dealers"],
              ["documents", "📄 Docs"],
              ["calculator", "🧮 Profit"],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              data-ocid={`manager.${value}.tab`}
              className="flex-1 text-xs data-[state=active]:text-neon"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="store" className="mt-4">
          <StoreTab />
        </TabsContent>
        <TabsContent value="materials" className="mt-4">
          <RawMaterialsTab />
        </TabsContent>
        <TabsContent value="dealers" className="mt-4">
          <DealersTab />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab />
        </TabsContent>
        <TabsContent value="calculator" className="mt-4">
          <CalculatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
