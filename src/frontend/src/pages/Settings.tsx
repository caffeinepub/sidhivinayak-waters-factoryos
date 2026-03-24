import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Droplets,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [form, setForm] = useState({
    companyName: "Sidhivinayak Waters",
    adminName: "Admin Singh",
    plantLocation: "Pune, Maharashtra",
    phone: "+91 98765 43210",
    email: "admin@sidhivinayakwaters.in",
    capacity: "2,00,000 L/day",
  });

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-700 text-foreground">Settings</h1>
        <p className="text-xs text-muted-custom mt-0.5">
          Company and plant configuration
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl card-glow p-6"
        style={{ background: "oklch(0.13 0.015 240)" }}
      >
        <div
          className="flex items-center gap-3 mb-6 pb-5 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center neon-glow"
            style={{
              background: "oklch(0.75 0.13 188 / 0.12)",
              border: "1px solid oklch(0.75 0.13 188 / 0.4)",
            }}
          >
            <Droplets className="w-6 h-6 text-neon" />
          </div>
          <div>
            <p className="text-base font-700 text-foreground">
              Company Settings
            </p>
            <p className="text-xs text-muted-custom">
              Update your plant information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-600 text-muted-custom flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Company Name
            </Label>
            <Input
              data-ocid="settings.input"
              value={form.companyName}
              onChange={(e) =>
                setForm((p) => ({ ...p, companyName: e.target.value }))
              }
              className="bg-[oklch(0.17_0.018_240)] border-[oklch(0.21_0.02_240)] text-foreground focus:border-[oklch(0.75_0.13_188)] focus:ring-[oklch(0.75_0.13_188/0.2)] text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-600 text-muted-custom flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Admin Name
            </Label>
            <Input
              data-ocid="settings.admin_input"
              value={form.adminName}
              onChange={(e) =>
                setForm((p) => ({ ...p, adminName: e.target.value }))
              }
              className="bg-[oklch(0.17_0.018_240)] border-[oklch(0.21_0.02_240)] text-foreground text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-600 text-muted-custom flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Plant Location
            </Label>
            <Input
              data-ocid="settings.location_input"
              value={form.plantLocation}
              onChange={(e) =>
                setForm((p) => ({ ...p, plantLocation: e.target.value }))
              }
              className="bg-[oklch(0.17_0.018_240)] border-[oklch(0.21_0.02_240)] text-foreground text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-600 text-muted-custom flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone
            </Label>
            <Input
              data-ocid="settings.phone_input"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              className="bg-[oklch(0.17_0.018_240)] border-[oklch(0.21_0.02_240)] text-foreground text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-600 text-muted-custom flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </Label>
            <Input
              data-ocid="settings.email_input"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className="bg-[oklch(0.17_0.018_240)] border-[oklch(0.21_0.02_240)] text-foreground text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-600 text-muted-custom">
              Plant Capacity
            </Label>
            <Input
              data-ocid="settings.capacity_input"
              value={form.capacity}
              onChange={(e) =>
                setForm((p) => ({ ...p, capacity: e.target.value }))
              }
              className="bg-[oklch(0.17_0.018_240)] border-[oklch(0.21_0.02_240)] text-foreground text-sm"
            />
          </div>
        </div>

        <div
          className="mt-6 pt-5 border-t flex justify-end"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <Button
            data-ocid="settings.submit_button"
            onClick={handleSave}
            className="flex items-center gap-2 text-sm font-600"
            style={{
              background: "oklch(0.75 0.13 188)",
              color: "oklch(0.09 0.012 240)",
              boxShadow: "0 0 12px oklch(0.75 0.13 188 / 0.3)",
            }}
          >
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
