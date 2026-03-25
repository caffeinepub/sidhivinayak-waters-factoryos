import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const handleBulkImport = async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length || !actor) return;
    setBulkProgress({ current: 0, total: lines.length });
    let saved = 0;
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      const material: RawMaterial = {
        id: crypto.randomUUID(),
        name: parts[0] || "",
        quantity: Number(parts[1]) || 0,
        unit: parts[2] || "pcs",
        status: parts[3] || "available",
        reorderLevel: Number(parts[4]) || 0,
        notes: parts[5] || "",
      };
      try {
        await actor.addRawMaterial(material);
        saved++;
      } catch {
        /* skip */
      }
      setBulkProgress({ current: saved, total: lines.length });
    }
    qc.invalidateQueries({ queryKey: ["rawMaterials"] });
    toast.success(`Saved ${saved} material${saved !== 1 ? "s" : ""}!`);
    setBulkOpen(false);
    setBulkText("");
    setBulkProgress(null);
  };

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
        await actor.addRawMaterial({
          id: crypto.randomUUID(),
          ...form,
        } as RawMaterial);
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
        <div className="flex gap-2">
          <Button
            data-ocid="rawmaterial.bulk_import_button"
            size="sm"
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="border-border text-muted-custom"
          >
            📥 Bulk Import
          </Button>
          <Button
            data-ocid="rawmaterial.add_button"
            size="sm"
            onClick={openAdd}
            style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Material
          </Button>
        </div>
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

      {/* Bulk Import Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Bulk Import Materials
            </DialogTitle>
            <DialogDescription className="text-muted-custom text-xs">
              One material per line: Name, Quantity, Unit, Status, ReorderLevel,
              Notes
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={
              "Water Bottles, 500, pcs, available, 50, 500ml\nBottle Caps, 2000, pcs, available, 200\nPackaging Tape, 10, roll, low"
            }
            className="bg-transparent border-border text-foreground resize-none font-mono text-xs"
            rows={8}
          />
          {bulkProgress && (
            <p className="text-xs text-neon text-center">
              Saving {bulkProgress.current} / {bulkProgress.total}...
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkOpen(false)}
              className="border-border text-muted-custom"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={!!bulkProgress || !bulkText.trim()}
              style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
            >
              {bulkProgress ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Import {bulkText.split("\n").filter((l) => l.trim()).length || ""}{" "}
              Materials
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

  // Search
  const [search, setSearch] = useState("");

  // Bulk import
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const filteredDealers = dealers.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.company.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q)
    );
  });

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
        await actor.addDealer({ id: crypto.randomUUID(), ...form } as Dealer);
      }
      qc.invalidateQueries({ queryKey: ["dealers"] });
      toast.success(editing ? "Dealer updated!" : "Dealer added!");
      setOpen(false);
    } catch (e) {
      toast.error(
        `Failed to save dealer: ${e instanceof Error ? e.message : String(e)}`,
      );
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

  const bulkLineCount = bulkText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean).length;

  const handleBulkImport = async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length || !actor) return;
    setBulkProgress({ current: 0, total: lines.length });
    let saved = 0;
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      const dealer: Dealer = {
        id: crypto.randomUUID(),
        name: parts[0] || "",
        phone: parts[1] || "",
        company: parts[2] || "",
        material: parts[3] || "",
        email: parts[4] || "",
        notes: parts[5] || "",
      };
      try {
        await actor.addDealer(dealer);
        saved++;
      } catch {
        /* skip failed */
      }
      setBulkProgress({ current: saved, total: lines.length });
    }
    qc.invalidateQueries({ queryKey: ["dealers"] });
    toast.success(`Saved ${saved} dealers!`);
    setBulkOpen(false);
    setBulkText("");
    setBulkProgress(null);
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-custom">
          {dealers.length} dealer{dealers.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button
            data-ocid="dealer.bulk_import_button"
            size="sm"
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="border-border text-muted-custom hover:text-foreground"
          >
            📥 Bulk Import
          </Button>
          <Button
            data-ocid="dealer.add_button"
            size="sm"
            onClick={openAdd}
            style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Dealer
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {dealers.length > 0 && (
        <Input
          data-ocid="dealer.search_input"
          placeholder="Search dealers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-border text-foreground placeholder:text-muted-custom"
        />
      )}

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
      ) : filteredDealers.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center text-muted-custom"
          style={{ background: "oklch(0.13 0.015 240)" }}
        >
          <p className="text-sm">No dealers match &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          data-ocid="dealer.list"
        >
          {filteredDealers.map((d, idx) => (
            <motion.div
              key={d.id}
              data-ocid={`dealer.item.${idx + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
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

      {/* Add / Edit single dealer dialog */}
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

      {/* Bulk Import dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent
          data-ocid="dealer.bulk_import_dialog"
          className="max-w-lg"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              📥 Bulk Import Dealers
            </DialogTitle>
            <DialogDescription className="text-muted-custom text-xs">
              Paste dealers below, one per line.
              <br />
              Format:{" "}
              <span style={{ color: "oklch(0.75 0.13 188)" }}>
                Name, Phone, Company, Material, Email, Notes
              </span>{" "}
              (all optional except Name)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              data-ocid="dealer.bulk_textarea"
              rows={12}
              disabled={!!bulkProgress}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Rahul Sharma, +91 98765 43210, Sharma Plastics, PET Bottles
Suresh Patel, +91 91234 56789, Patel Caps Co, Bottle Caps
Amit Gupta, +91 88888 77777, Gupta Packaging
...paste 100+ dealers here`}
              className="bg-transparent border-border text-foreground resize-none text-xs font-mono placeholder:text-muted-custom/50"
            />

            {bulkProgress && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-custom">
                  <span>Saving dealers...</span>
                  <span style={{ color: "oklch(0.75 0.13 188)" }}>
                    {bulkProgress.current} / {bulkProgress.total}
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-1.5 overflow-hidden"
                  style={{ background: "oklch(0.21 0.02 240)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                      background: "oklch(0.75 0.13 188)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button
              data-ocid="dealer.bulk_cancel_button"
              variant="outline"
              onClick={() => {
                setBulkOpen(false);
                setBulkText("");
                setBulkProgress(null);
              }}
              disabled={!!bulkProgress}
              className="border-border text-muted-custom"
            >
              Cancel
            </Button>
            <Button
              data-ocid="dealer.bulk_submit_button"
              onClick={handleBulkImport}
              disabled={bulkLineCount === 0 || !!bulkProgress}
              style={{ background: "oklch(0.75 0.13 188)", color: "#000" }}
            >
              {bulkProgress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving{" "}
                  {bulkProgress.current}/{bulkProgress.total}...
                </>
              ) : (
                `Import ${bulkLineCount} Dealer${bulkLineCount !== 1 ? "s" : ""}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

async function compressImage(dataUrl: string, maxKB = 700): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      const MAX_DIM = 1200;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.8;
      let result = canvas.toDataURL("image/jpeg", quality);
      while (result.length > maxKB * 1024 * 1.37 && quality > 0.2) {
        quality -= 0.1;
        result = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(result);
    };
    img.src = dataUrl;
  });
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
  const [bulkSaving, setBulkSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [imgPreview, setImgPreview] = useState<string>("");
  const [pdfPreview, setPdfPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    if (docs.length >= 100) {
      toast.error("Document limit reached (max 100). Delete some to add more.");
      return;
    }
    setEditing(null);
    setForm(blankDoc());
    setImgPreview("");
    setPdfPreview("");
    setOpen(true);
  };

  const handleBulkFiles = async (files: FileList, _type: "image" | "pdf") => {
    if (!actor) return;
    const remaining = 100 - docs.length;
    if (remaining <= 0) {
      toast.error("Document limit reached (max 100).");
      return;
    }
    const toProcess = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.error(
        `Only ${remaining} slots left. Adding first ${remaining} files.`,
      );
    }
    setBulkSaving(true);
    try {
      await Promise.all(
        toProcess.map(
          (file) =>
            new Promise<void>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = async (ev) => {
                try {
                  let rawContent = ev.target?.result as string;
                  if (rawContent.startsWith("data:image/")) {
                    rawContent = await compressImage(rawContent);
                  }
                  if (rawContent.length > 1_800_000) {
                    reject(
                      new Error(
                        `File "${file.name}" is too large (max ~1.3MB)`,
                      ),
                    );
                    return;
                  }
                  await actor.addDocument({
                    id: crypto.randomUUID(),
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    content: rawContent,
                    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
                    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
                  } as Document);
                  resolve();
                } catch (e) {
                  reject(e);
                }
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }),
        ),
      );
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success(
        `${toProcess.length} document${toProcess.length !== 1 ? "s" : ""} added!`,
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to add some documents";
      toast.error(msg);
    } finally {
      setBulkSaving(false);
    }
  };
  const openEdit = (d: Document) => {
    setEditing(d);
    if (d.content.startsWith("data:image/")) {
      setImgPreview(d.content);
      setPdfPreview("");
      setForm({ title: d.title, content: "" });
    } else if (d.content.startsWith("data:application/pdf")) {
      setPdfPreview(d.content);
      setImgPreview("");
      setForm({ title: d.title, content: "" });
    } else {
      setImgPreview("");
      setPdfPreview("");
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
      let saveContent = imgPreview || pdfPreview || form.content;
      if (saveContent.startsWith("data:image/")) {
        saveContent = await compressImage(saveContent);
      }
      if (saveContent.length > 1_800_000) {
        toast.error("File is too large to save. Please use a smaller image.");
        setSaving(false);
        return;
      }
      if (editing) {
        await actor.updateDocument(editing.id, {
          ...editing,
          ...form,
          content: saveContent,
        } as Document);
      } else {
        await actor.addDocument({
          id: crypto.randomUUID(),
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
          {docs.length}/100 document{docs.length !== 1 ? "s" : ""}
          {docs.length >= 90 && (
            <span className="ml-1 text-yellow-400 text-xs">
              ({100 - docs.length} left)
            </span>
          )}
        </p>
        <Button
          data-ocid="document.add_button"
          size="sm"
          onClick={openAdd}
          disabled={docs.length >= 100 || bulkSaving}
          style={{
            background:
              docs.length >= 100
                ? "oklch(0.30 0.02 240)"
                : "oklch(0.75 0.13 188)",
            color: docs.length >= 100 ? "#666" : "#000",
          }}
        >
          {bulkSaving ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          {bulkSaving ? "Uploading..." : "Add Document"}
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
                  ) : d.content.startsWith("data:application/pdf") ? (
                    <span className="text-base flex-shrink-0">📄</span>
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
                    ) : d.content.startsWith("data:application/pdf") ? (
                      <div className="mt-3 flex flex-col gap-2">
                        <p className="text-xs text-tertiary">PDF Document</p>
                        <button
                          type="button"
                          onClick={() => {
                            const w = window.open();
                            if (w) {
                              w.document.write(
                                `<iframe src="${d.content}" width="100%" height="100%" style="border:none;"></iframe>`,
                              );
                              w.document.close();
                            }
                          }}
                          className="text-sm font-semibold py-2 rounded-xl"
                          style={{
                            background: "oklch(0.20 0.02 240)",
                            color: "oklch(0.75 0.13 188)",
                            border: "1px solid oklch(0.75 0.13 188)",
                          }}
                        >
                          📄 Open PDF
                        </button>
                      </div>
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
                disabled={!!imgPreview || !!pdfPreview}
                style={
                  imgPreview || pdfPreview
                    ? { opacity: 0.4, cursor: "not-allowed" }
                    : {}
                }
              />
            </div>
            <p className="text-xs text-tertiary text-center">— or —</p>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  if (files.length > 1) {
                    handleBulkFiles(files, "image");
                    setOpen(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                  }
                  const file = files[0];
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    let raw = ev.target?.result as string;
                    raw = await compressImage(raw);
                    setImgPreview(raw);
                    setPdfPreview("");
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  if (files.length > 1) {
                    handleBulkFiles(files, "pdf");
                    setOpen(false);
                    if (pdfInputRef.current) pdfInputRef.current.value = "";
                    return;
                  }
                  const file = files[0];
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setPdfPreview(ev.target?.result as string);
                    setImgPreview("");
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="document.upload_button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    border: "1px solid oklch(0.75 0.13 188)",
                    background: "oklch(0.10 0.015 240)",
                    color: "oklch(0.75 0.13 188)",
                  }}
                >
                  📷 From Gallery
                </button>
                <button
                  type="button"
                  data-ocid="document.pdf_upload_button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    border: "1px solid oklch(0.65 0.13 30)",
                    background: "oklch(0.10 0.015 240)",
                    color: "oklch(0.75 0.15 30)",
                  }}
                >
                  📄 Upload PDF
                </button>
              </div>
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
              {pdfPreview && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: "oklch(0.16 0.02 240)",
                    border: "1px solid oklch(0.30 0.05 30)",
                  }}
                >
                  <span className="text-lg">📄</span>
                  <span className="text-sm text-foreground flex-1">
                    PDF ready to save
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfPreview("");
                      if (pdfInputRef.current) pdfInputRef.current.value = "";
                    }}
                    className="text-xs text-red-400"
                  >
                    ✕
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
