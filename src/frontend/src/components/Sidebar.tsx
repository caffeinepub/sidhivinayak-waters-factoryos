import {
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  ChevronRight,
  Crown,
  Factory,
  LayoutDashboard,
  MessageCircle,
  Package,
  Receipt,
  ScanLine,
  Settings,
  Store,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useOwner } from "../context/OwnerContext";

export type Page =
  | "dashboard"
  | "customers"
  | "production"
  | "inventory"
  | "delivery"
  | "billing"
  | "reports"
  | "settings"
  | "scanner"
  | "shops"
  | "khata"
  | "ai-panel"
  | "chat"
  | "manager"
  | "owner-ai";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasChildren?: boolean;
  section?: string;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "main",
  },
  { id: "scanner", label: "QR Scanner", icon: ScanLine, section: "main" },
  { id: "customers", label: "Customers", icon: Users, section: "ops" },
  { id: "production", label: "Production", icon: Factory, section: "ops" },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    hasChildren: true,
    section: "ops",
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: Truck,
    hasChildren: true,
    section: "ops",
  },
  { id: "shops", label: "Shops", icon: Store, section: "sales" },
  { id: "billing", label: "Billing", icon: Receipt, section: "sales" },
  { id: "khata", label: "Khata", icon: BookOpen, section: "sales" },
  {
    id: "manager",
    label: "Manager Panel",
    icon: Briefcase,
    section: "management",
  },
  { id: "chat", label: "Team Chat", icon: MessageCircle, section: "comm" },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    hasChildren: true,
    section: "intel",
  },
  {
    id: "ai-panel",
    label: "AI Panel",
    icon: Brain,
    hasChildren: true,
    section: "intel",
  },
  { id: "settings", label: "Settings", icon: Settings, section: "intel" },
  {
    id: "owner-ai",
    label: "Owner AI",
    icon: Crown,
    section: "owner",
    ownerOnly: true,
  },
];

const sections: { key: string; label: string }[] = [
  { key: "main", label: "" },
  { key: "ops", label: "Operations" },
  { key: "sales", label: "Sales" },
  { key: "management", label: "Management" },
  { key: "comm", label: "Communication" },
  { key: "intel", label: "Intelligence" },
  { key: "owner", label: "Owner" },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  activePage,
  onNavigate,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { config } = useOwner();

  const visibleItems = navItems.filter(
    (item) => !config.hiddenPages.includes(item.id),
  );

  return (
    <>
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onToggle();
          }}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-30 w-64 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:relative lg:z-auto`}
        style={{
          background: "oklch(0.10 0.012 240)",
          borderRight: "1px solid oklch(0.21 0.02 240)",
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <img
            src="/assets/generated/sidhivinayak-logo-transparent.dim_400x400.png"
            className="w-10 h-10 object-contain flex-shrink-0"
            alt="Sidhivinayak Waters Logo"
          />
          <div>
            <p className="text-sm font-bold text-neon leading-tight">
              Sidhivinayak
            </p>
            <p className="text-xs font-semibold text-neon leading-tight">
              Waters
            </p>
            <p className="text-[10px] text-tertiary leading-tight">FactoryOS</p>
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            className="ml-auto lg:hidden text-tertiary hover:text-neon"
            onClick={onToggle}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {sections.map((section) => {
            const items = visibleItems.filter((i) => i.section === section.key);
            if (items.length === 0) return null;
            return (
              <div key={section.key}>
                {section.label && (
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest px-3 pt-4 pb-1.5"
                    style={{
                      color:
                        section.key === "owner"
                          ? "oklch(0.78 0.15 85 / 0.7)"
                          : undefined,
                    }}
                  >
                    {section.key !== "owner" ? (
                      <span className="text-tertiary">{section.label}</span>
                    ) : (
                      <span style={{ color: "oklch(0.78 0.15 85 / 0.7)" }}>
                        ⚡ {section.label}
                      </span>
                    )}
                  </p>
                )}
                {items.map((item) => {
                  const isActive = activePage === item.id;
                  const isOwner = item.ownerOnly;
                  const Icon = item.icon;
                  const displayLabel =
                    config.customLabels[item.id] || item.label;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      data-ocid={`nav.${item.id}.link`}
                      onClick={() => onNavigate(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group"
                      style={
                        isActive && isOwner
                          ? {
                              background: "oklch(0.78 0.15 85 / 0.12)",
                              border: "1px solid oklch(0.78 0.15 85 / 0.4)",
                              boxShadow: "0 0 14px oklch(0.78 0.15 85 / 0.2)",
                            }
                          : isActive
                            ? {
                                background: "oklch(0.75 0.13 188 / 0.12)",
                                border: "1px solid oklch(0.75 0.13 188 / 0.3)",
                                boxShadow:
                                  "0 0 12px oklch(0.75 0.13 188 / 0.15)",
                              }
                            : { border: "1px solid transparent" }
                      }
                    >
                      <span
                        className="flex-shrink-0"
                        style={{
                          color: isOwner
                            ? isActive
                              ? "oklch(0.78 0.15 85)"
                              : "oklch(0.78 0.15 85 / 0.7)"
                            : undefined,
                        }}
                      >
                        <Icon
                          className={
                            isOwner
                              ? "w-4 h-4"
                              : `w-4 h-4 ${isActive ? "text-neon" : "text-tertiary group-hover:text-neon-bright"}`
                          }
                        />
                      </span>
                      <span
                        className={`text-sm flex-1 transition-colors font-medium ${
                          isOwner
                            ? ""
                            : isActive
                              ? "text-neon font-semibold"
                              : "text-muted-custom group-hover:text-foreground"
                        }`}
                        style={{
                          color: isOwner
                            ? isActive
                              ? "oklch(0.78 0.15 85)"
                              : "oklch(0.78 0.15 85 / 0.7)"
                            : undefined,
                          fontWeight: isOwner ? 700 : undefined,
                        }}
                      >
                        {displayLabel}
                      </span>
                      {isOwner && (
                        <span
                          className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                          style={{
                            background: "oklch(0.78 0.15 85 / 0.15)",
                            color: "oklch(0.78 0.15 85)",
                            border: "1px solid oklch(0.78 0.15 85 / 0.3)",
                          }}
                        >
                          OWNER
                        </span>
                      )}
                      {item.hasChildren && !isOwner && (
                        <ChevronRight
                          className={`w-3 h-3 ${isActive ? "text-neon" : "text-tertiary"}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <p className="text-[10px] text-tertiary text-center">
            © {new Date().getFullYear()}{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neon transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}
