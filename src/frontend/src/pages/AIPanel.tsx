import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Lightbulb,
  Loader2,
  Send,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

const agents = [
  {
    icon: "🧠",
    name: "AI Manager",
    role: "Controls operations & gives suggestions",
    status: "active",
  },
  {
    icon: "📊",
    name: "AI Analyst",
    role: "Sales trends & demand insights",
    status: "active",
  },
  {
    icon: "💼",
    name: "AI CA",
    role: "Profit estimation & payment tracking",
    status: "active",
  },
  {
    icon: "⚖️",
    name: "AI Legal",
    role: "Risk alerts & compliance",
    status: "active",
  },
  {
    icon: "🧑‍💼",
    name: "AI Operations",
    role: "Tracks managers & detects delays",
    status: "active",
  },
];

function getAIResponse(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("inventory") || m.includes("stock"))
    return "📦 Inventory Insight: Monitor your stock levels daily. For a water bottling plant, maintain at least 2 weeks of PET bottle stock. Use the Low Stock alerts to trigger reorder before running out. Consider setting reorder levels at 20% of monthly consumption.";
  if (m.includes("production") || m.includes("batch"))
    return "🏭 Production Tip: Track every batch with QR codes. Optimal shift planning — ensure 3 production runs per day for maximum output. Log MFG/EXP dates accurately on every box. Review batch rejection rates weekly.";
  if (m.includes("billing") || m.includes("invoice"))
    return "🧾 Billing Insight: Follow up on unpaid invoices within 7 days. Offer early payment discounts (1-2%) to improve cash flow. Use the series field to track seasonal billing cycles. Share bills via WhatsApp for faster payment confirmation.";
  if (m.includes("profit") || m.includes("revenue") || m.includes("loss"))
    return "💰 Profit Optimization: For a water factory, target 35-45% gross margin. Key cost drivers are packaging materials (30%), labor (25%), and utilities (15%). Bulk purchasing of raw materials can reduce material costs by 10-15%.";
  if (
    m.includes("raw material") ||
    m.includes("material") ||
    m.includes("bottle")
  )
    return "🧴 Material Management: Maintain supplier relationships with at least 2 backup dealers per material. PET preforms and caps are critical — never let stock fall below 3-day supply. Track material quality in your documents module.";
  if (m.includes("delivery") || m.includes("dispatch") || m.includes("truck"))
    return "🚚 Delivery Optimization: Group deliveries by area to reduce fuel costs. Real-time tracking via delivery status helps reduce customer complaints by 40%. Prioritize paid orders for same-day dispatch.";
  if (m.includes("shop") || m.includes("dealer") || m.includes("customer"))
    return "🏪 Shop Management: Maintain Khata records for every shop. High-frequency shops (daily orders) deserve priority delivery slots. Review shop credit limits monthly using the Khata balance data.";
  if (m.includes("help") || m.includes("what can"))
    return "🤖 I can help with: inventory management, production optimization, billing insights, profit analysis, raw material procurement, delivery scheduling, shop management, and factory operations. Just ask about any topic!";
  return "🧠 Factory Analysis: Based on standard water bottling operations, focus on three pillars: (1) Quality — log every batch and maintain QR traceability, (2) Cash Flow — follow up invoices weekly and track Khata balances, (3) Efficiency — optimize production shifts and minimize raw material wastage. What specific area would you like to improve?";
}

interface ChatMsg {
  id: string;
  role: "user" | "ai";
  text: string;
}

export default function AIPanel() {
  const { actor } = useActor();
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: "intro",
      role: "ai",
      text: "👋 Hello! I'm your FactoryOS AI Assistant. I can help with inventory, production, billing, profit analysis, raw materials, and more. What would you like to know?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const askAgent = (agentName: string) => {
    const topics: Record<string, string> = {
      "AI Manager": "What should I focus on for better operations management?",
      "AI Analyst": "What are the current sales trends?",
      "AI CA": "How can I improve profit and payment tracking?",
      "AI Legal": "What compliance risks should I be aware of?",
      "AI Operations": "How can I optimize production and delivery?",
    };
    const text = topics[agentName] || `Tell me about ${agentName}`;
    if (isThinking) return;
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", text };
    setChatMessages((p) => [...p, userMsg]);
    setIsThinking(true);
    setTimeout(
      () => {
        const aiText = getAIResponse(text);
        setChatMessages((p) => [
          ...p,
          { id: `a-${Date.now()}`, role: "ai", text: aiText },
        ]);
        setIsThinking(false);
        setTimeout(
          () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      },
      1000 + Math.random() * 800,
    );
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isThinking) return;
    setChatInput("");
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", text };
    setChatMessages((p) => [...p, userMsg]);
    setIsThinking(true);
    setTimeout(() => {
      const aiText = getAIResponse(text);
      setChatMessages((p) => [
        ...p,
        { id: `a-${Date.now()}`, role: "ai", text: aiText },
      ]);
      setIsThinking(false);
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }, 1000);
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await actor!.getAllInvoices()) as any[],
    enabled: !!actor,
  });
  const { data: lowStock = [] } = useQuery({
    queryKey: ["lowStock"],
    queryFn: async () => (await actor!.getLowStockItems()) as any[],
    enabled: !!actor,
  });
  const { data: pendingDeliveries = [] } = useQuery({
    queryKey: ["pendingDeliveries"],
    queryFn: async () => (await actor!.getPendingDeliveries()) as any[],
    enabled: !!actor,
  });
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => (await actor!.getAllBatches()) as any[],
    enabled: !!actor,
  });

  const unpaidInvoices = invoices.filter((i: any) => i.status === "unpaid");
  const unpaidAmount = unpaidInvoices.reduce(
    (s: number, i: any) => s + i.amount,
    0,
  );
  const paidAmount = invoices
    .filter((i: any) => i.status === "paid")
    .reduce((s: number, i: any) => s + i.amount, 0);

  const now = new Date();
  const thisMonthBatches = batches.filter((b: any) => {
    const d = new Date(Number(b.date) / 1_000_000);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  // Most active product
  const productQty: Record<string, number> = {};
  for (const b of batches as any[]) {
    productQty[b.product] = (productQty[b.product] || 0) + Number(b.quantity);
  }
  const topProduct = Object.entries(productQty).sort(
    ([, a], [, b]) => b - a,
  )[0];
  const productLabels: Record<string, string> = {
    jar20L: "20L Jars",
    bottle1L: "1L Bottles",
    bottle500ml: "500ml Bottles",
    bottle200ml: "200ml Cups",
  };

  const today = new Date().toDateString();
  const todayBatches = batches.filter(
    (b: any) => new Date(Number(b.date) / 1_000_000).toDateString() === today,
  );

  const alerts = [
    lowStock.length > 0 && {
      icon: AlertTriangle,
      color: "oklch(0.73 0.16 65)",
      bg: "oklch(0.73 0.16 65 / 0.08)",
      border: "oklch(0.73 0.16 65 / 0.3)",
      text: `${lowStock.length} item${lowStock.length > 1 ? "s" : ""} running low on stock — restock soon`,
    },
    pendingDeliveries.length > 0 && {
      icon: Truck,
      color: "oklch(0.75 0.13 188)",
      bg: "oklch(0.75 0.13 188 / 0.08)",
      border: "oklch(0.75 0.13 188 / 0.3)",
      text: `${pendingDeliveries.length} deliver${pendingDeliveries.length > 1 ? "ies" : "y"} pending dispatch`,
    },
    unpaidInvoices.length > 0 && {
      icon: Wallet,
      color: "oklch(0.6 0.22 25)",
      bg: "oklch(0.6 0.22 25 / 0.08)",
      border: "oklch(0.6 0.22 25 / 0.3)",
      text: `${unpaidInvoices.length} invoice${unpaidInvoices.length > 1 ? "s" : ""} unpaid — ₹${unpaidAmount.toLocaleString("en-IN")} outstanding`,
    },
  ].filter(Boolean) as {
    icon: any;
    color: string;
    bg: string;
    border: string;
    text: string;
  }[];

  const insights = [
    {
      icon: BarChart3,
      color: "oklch(0.75 0.13 188)",
      label: "This Month Production",
      value: `${thisMonthBatches.length} batch${thisMonthBatches.length !== 1 ? "es" : ""}`,
    },
    {
      icon: TrendingUp,
      color: "oklch(0.73 0.17 150)",
      label: "Revenue Collected",
      value: `₹${paidAmount.toLocaleString("en-IN")}`,
    },
    {
      icon: Wallet,
      color: "oklch(0.73 0.16 65)",
      label: "Outstanding Payments",
      value: `₹${unpaidAmount.toLocaleString("en-IN")}`,
    },
    topProduct && {
      icon: BarChart3,
      color: "oklch(0.75 0.13 188)",
      label: "Top Product",
      value: productLabels[topProduct[0]] || topProduct[0],
    },
  ].filter(Boolean) as {
    icon: any;
    color: string;
    label: string;
    value: string;
  }[];

  const suggestions: string[] = [];
  if (unpaidInvoices.length > invoices.length * 0.4 && invoices.length > 0)
    suggestions.push(
      "High unpaid ratio — consider following up with customers",
    );
  if (lowStock.length > 0)
    suggestions.push(
      `Restock these items: ${(lowStock as any[]).map((i) => i.name).join(", ")}`,
    );
  if (todayBatches.length === 0)
    suggestions.push("No production batches logged for today");
  suggestions.push("System running normally — all managers active");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "oklch(0.75 0.13 188 / 0.12)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
          }}
        >
          <Brain className="w-5 h-5 text-neon" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            AI Command Center
          </h1>
          <p className="text-xs text-muted-custom mt-0.5">
            Jarvis-style intelligence panel for FactoryOS
          </p>
        </div>
        {isLoading && (
          <Loader2 className="w-4 h-4 text-neon animate-spin ml-auto" />
        )}
      </div>

      {/* AI Agents */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          AI Agents
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl p-3 text-center card-glow"
              style={{
                background: "oklch(0.13 0.015 240)",
                border: `1px solid ${agent.status === "active" ? "oklch(0.75 0.13 188 / 0.3)" : "oklch(0.21 0.02 240)"}`,
              }}
            >
              <div className="text-2xl mb-2">{agent.icon}</div>
              <p className="text-xs font-bold text-foreground leading-tight">
                {agent.name}
              </p>
              <p className="text-[10px] text-tertiary mt-1 leading-tight">
                {agent.role}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      agent.status === "active"
                        ? "oklch(0.73 0.17 150)"
                        : "oklch(0.5 0 0)",
                    boxShadow:
                      agent.status === "active"
                        ? "0 0 6px oklch(0.73 0.17 150)"
                        : "none",
                    animation:
                      agent.status === "active"
                        ? "pulse 2s ease-in-out infinite"
                        : "none",
                  }}
                />
                <span
                  className="text-[10px]"
                  style={{
                    color:
                      agent.status === "active"
                        ? "oklch(0.73 0.17 150)"
                        : "oklch(0.5 0 0)",
                  }}
                >
                  {agent.status === "active" ? "Active" : "Standby"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => askAgent(agent.name)}
                className="mt-2 w-full text-[10px] py-1 rounded-md font-semibold transition-opacity hover:opacity-80"
                style={{
                  background: "oklch(0.75 0.13 188 / 0.15)",
                  color: "oklch(0.75 0.13 188)",
                }}
              >
                Ask AI
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          ⚠️ Alerts
        </p>
        {alerts.length === 0 ? (
          <div
            className="rounded-xl p-4 text-sm text-muted-custom"
            style={{ background: "oklch(0.13 0.015 240)" }}
          >
            No active alerts — all systems normal ✅
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((a, alertIdx) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: alertIdx * 0.08 }}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: a.color }}
                  />
                  <p className="text-sm font-medium" style={{ color: a.color }}>
                    {a.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insights */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          📊 Insights
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((ins, insIdx) => {
            const Icon = ins.icon;
            return (
              <motion.div
                key={ins.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: insIdx * 0.07 }}
                className="rounded-xl p-4 card-glow"
                style={{
                  background: "oklch(0.13 0.015 240)",
                  border: `1px solid ${ins.color} / 0.2`,
                }}
              >
                <Icon className="w-4 h-4 mb-2" style={{ color: ins.color }} />
                <p className="text-lg font-bold text-foreground">{ins.value}</p>
                <p className="text-[11px] text-muted-custom mt-0.5">
                  {ins.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          💡 Suggestions
        </p>
        <div className="space-y-2">
          {suggestions.map((s, sugIdx) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sugIdx * 0.08 }}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: "oklch(0.73 0.17 150 / 0.06)",
                border: "1px solid oklch(0.73 0.17 150 / 0.2)",
              }}
            >
              <span
                className="text-sm"
                style={{ color: "oklch(0.73 0.17 150)" }}
              >
                →
              </span>
              <p className="text-sm text-foreground">{s}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Assistant Chat */}
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
          🤖 AI Assistant — Ask Me Anything
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.75 0.13 188 / 0.25)",
          }}
        >
          {/* Chat messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background: "oklch(0.75 0.13 188 / 0.2)",
                            color: "oklch(0.9 0.05 188)",
                            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
                          }
                        : {
                            background: "oklch(0.11 0.012 240)",
                            color: "oklch(0.85 0.02 240)",
                            border: "1px solid oklch(0.21 0.02 240)",
                          }
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="rounded-xl px-4 py-3 flex gap-1 items-center"
                    style={{
                      background: "oklch(0.11 0.012 240)",
                      border: "1px solid oklch(0.21 0.02 240)",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "oklch(0.75 0.13 188)",
                          animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
          {/* Input */}
          <div
            className="flex gap-2 p-3 border-t"
            style={{ borderColor: "oklch(0.21 0.02 240)" }}
          >
            <input
              data-ocid="ai.chat.input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask about inventory, production, billing, profit..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-tertiary"
            />
            <button
              type="button"
              data-ocid="ai.chat.button"
              onClick={sendMessage}
              disabled={isThinking || !chatInput.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: "oklch(0.75 0.13 188)" }}
            >
              <Send className="w-4 h-4" style={{ color: "#000" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
