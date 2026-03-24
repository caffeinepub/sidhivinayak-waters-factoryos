import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { useState } from "react";
import Sidebar, { type Page } from "./components/Sidebar";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import Delivery from "./pages/Delivery";
import Inventory from "./pages/Inventory";
import Production from "./pages/Production";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function pageTitle(page: Page): string {
  const titles: Record<Page, string> = {
    dashboard: "Dashboard",
    production: "Production",
    inventory: "Inventory",
    delivery: "Delivery",
    billing: "Billing",
    reports: "Reports",
    settings: "Settings",
  };
  return titles[page];
}

function AppContent() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "production":
        return <Production />;
      case "inventory":
        return <Inventory />;
      case "delivery":
        return <Delivery />;
      case "billing":
        return <Billing />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.09 0.012 240) 0%, oklch(0.11 0.015 240) 100%)",
      }}
    >
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{
            background: "oklch(0.10 0.012 240)",
            borderColor: "oklch(0.21 0.02 240)",
          }}
        >
          <button
            type="button"
            data-ocid="nav.menu.button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {pageTitle(activePage)}
          </span>
          <span className="ml-auto text-xs text-neon font-semibold">
            Sidhivinayak Waters
          </span>
        </div>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">{renderPage()}</main>

        <footer
          className="px-6 py-3 border-t flex items-center justify-center"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <p className="text-[11px] text-tertiary">
            © {new Date().getFullYear()} Sidhivinayak Waters FactoryOS · Built
            with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
