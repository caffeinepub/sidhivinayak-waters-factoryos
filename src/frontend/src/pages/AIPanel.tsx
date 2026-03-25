import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Cpu,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

// ─── Constants ────────────────────────────────────────────────────────────────
const INTELLIGENCE_LEVELS = [
  "Novice",
  "Apprentice",
  "Advanced",
  "Expert",
  "Genius",
  "Omniscient",
];

const AGENT_DEFS = [
  { icon: "🧠", name: "AI Manager", role: "Operations & strategy command" },
  { icon: "📊", name: "AI Analyst", role: "Sales trends & forecasting" },
  { icon: "💼", name: "AI CA", role: "Finance & profit optimization" },
  { icon: "⚖️", name: "AI Legal", role: "Compliance & risk management" },
  {
    icon: "🧑‍💼",
    name: "AI Operations",
    role: "Logistics & production efficiency",
  },
];

const QUICK_CHIPS = [
  {
    label: "📦 Stock Status",
    question: "What is the current stock status and reorder strategy?",
  },
  {
    label: "💰 Profit Analysis",
    question: "Give me a detailed profit analysis and optimization tips",
  },
  {
    label: "🏭 Production Tips",
    question: "How can I optimize production batch efficiency?",
  },
  {
    label: "⚖️ GST Compliance",
    question: "What are the GST compliance requirements I need to follow?",
  },
  {
    label: "🚚 Delivery Optimization",
    question: "How can I optimize delivery routes and reduce logistics costs?",
  },
  {
    label: "📊 Sales Forecast",
    question: "Give me a sales forecast and demand analysis",
  },
];

// ─── Response Engine ───────────────────────────────────────────────────────────
function getAIResponse(
  message: string,
  agentName: string,
  level: number,
): string {
  const m = message.toLowerCase();
  const levelBonus = level >= 7 ? " [DEEP ANALYSIS MODE ACTIVE]" : "";
  const module = `[${agentName} Neural Module v${level}.0${levelBonus}]`;

  if (m.includes("inventory") || m.includes("stock") || m.includes("reorder")) {
    return `${module}\n\n📦 INVENTORY INTELLIGENCE REPORT:\n\n• ABC Analysis: Classify items — A-class (20% items = 80% value) need daily tracking, B-class weekly, C-class monthly. For a water factory, PET bottles & caps are A-class.\n• Safety Stock Formula: Safety Stock = (Max Daily Usage × Max Lead Time) − (Avg Daily Usage × Avg Lead Time). For PET preforms, maintain 7-day buffer minimum.\n• Reorder Point = (Average Daily Usage × Lead Time) + Safety Stock. Set automated alerts at 150% of this threshold.\n• Current optimal reorder levels: PET caps at 500kg, preforms at 200kg, labels at 5000 units — adjust based on your monthly production volume.\n• Cost Reduction: Bulk purchasing of raw materials saves 12-18% — negotiate 90-day rate lock with suppliers.\n\n→ Next Step: Review your top 3 low-stock items and contact backup dealers today.`;
  }

  if (m.includes("production") || m.includes("batch") || m.includes("shift")) {
    return `${module}\n\n🏭 PRODUCTION OPTIMIZATION ANALYSIS:\n\n• Shift Planning: Run 3 production shifts (6AM–2PM, 2PM–10PM, 10PM–6AM). Night shift typically yields 8-12% higher output due to lower ambient temperature affecting water quality.\n• Batch QR Tracking: Scan every box at production, warehouse entry, and dispatch. This creates full traceability — critical for FSSAI compliance.\n• Yield Rate Target: Aim for 97%+ fill accuracy. A 1% improvement on 1000L/day = 10L saved = ₹150/day extra revenue.\n• Quality Checkpoints: pH test (6.5–8.5), TDS test (<150ppm), turbidity (<1 NTU) — log every batch result.\n• Machine Downtime: Track every stoppage. Industry benchmark: <2% downtime. Each hour of downtime costs approximately ₹2,000–5,000 in lost production.\n\n→ Next Step: Set up daily batch KPI target of 85% capacity utilization.`;
  }

  if (m.includes("billing") || m.includes("invoice") || m.includes("payment")) {
    return `${module}\n\n🧾 CASH FLOW & BILLING INTELLIGENCE:\n\n• Follow-up Sequence: Day 1 — WhatsApp bill share, Day 7 — payment reminder call, Day 14 — visit + discount offer (1%), Day 21 — credit suspension warning.\n• Early Payment Incentive: Offer 1.5% discount for payment within 3 days. This costs less than the interest on delayed receivables.\n• Invoice Aging Analysis: <30 days = green, 30-60 days = yellow (follow up), >60 days = red (escalate to owner).\n• Cash Flow Tip: If unpaid invoices exceed 30% of monthly revenue, your working capital is at risk. Current target: <15% unpaid ratio.\n• WhatsApp Automation: Send PDF bills via WhatsApp instantly — shops that receive digital bills pay 40% faster than those receiving paper.\n\n→ Next Step: Create a payment due list today and contact the top 5 debtors.`;
  }

  if (
    m.includes("profit") ||
    m.includes("revenue") ||
    m.includes("loss") ||
    m.includes("margin")
  ) {
    return `${module}\n\n💰 DEEP P&L INTELLIGENCE ANALYSIS:\n\n• Water Factory P&L Benchmark: Revenue breakdown — 20L jars (50%), 1L bottles (30%), 500ml (15%), others (5%).\n• Cost Structure: Raw materials 30-35%, Labor 20-25%, Utilities (electricity+fuel) 15-18%, Packaging 10-12%, Logistics 8-10%, Overheads 5-7%.\n• Gross Margin Target: 40-48% for a mid-scale water factory. If below 35%, review material procurement costs.\n• Net Profit Benchmark: 12-18% net margin after all expenses. Below 10% = urgent cost review needed.\n• Profit Multiplier: Increasing 20L jar reuse rate by 10% can add ₹15,000-25,000/month directly to bottom line.\n\n→ Next Step: Run a monthly P&L comparison against last month using the Reports module.`;
  }

  if (
    m.includes("raw material") ||
    m.includes("bottle") ||
    m.includes("pet") ||
    m.includes("cap") ||
    m.includes("material")
  ) {
    return `${module}\n\n🧴 RAW MATERIAL INTELLIGENCE:\n\n• Supplier Diversification: Never rely on a single supplier. Maintain 2 primary + 1 emergency supplier per critical material. Price negotiation leverage increases 25% with multiple quotes.\n• PET Quality Standards: Food-grade PET must be BPA-free, FDA-approved. Check certificates quarterly. Low-grade PET can contaminate product and create FSSAI violations (₹50,000+ fine).\n• Cost Reduction Strategy: Consolidate orders — monthly bulk vs weekly small orders saves 8-15% per kg. Coordinate with other water factories for group purchasing power.\n• Lead Time Management: PET preforms = 3-5 day lead time, caps = 2-3 days, labels = 1-2 days. Order before hitting 20% stock threshold.\n• Waste Reduction: Track material wastage per batch. Industry standard: <2% preform wastage. Above that = machine calibration issue.\n\n→ Next Step: Audit your top supplier contracts and negotiate 6-month rate locks.`;
  }

  if (
    m.includes("delivery") ||
    m.includes("dispatch") ||
    m.includes("logistics") ||
    m.includes("route")
  ) {
    return `${module}\n\n🚚 LOGISTICS OPTIMIZATION INTELLIGENCE:\n\n• Route Optimization: Group deliveries by area (North/South/East/West zones). Optimal route planning reduces fuel costs by 20-30% and driver hours by 2-3 hrs/day.\n• Delivery Time Windows: Schedule deliveries 8AM-11AM for shops (before peak hours) and 4PM-7PM for residential. On-time delivery improves customer retention by 35%.\n• Fuel Cost Control: Track km/liter for each vehicle. Set monthly fuel budget alerts. Electric 3-wheelers for short routes (<15km) save ₹800-1200/day in fuel.\n• Customer Satisfaction Metric: Target <2% delivery complaints. Each complaint costs 3x in customer acquisition to replace that customer.\n• Priority Dispatch: Paid invoices get same-day delivery, credit customers get next-day. This accelerates payment collection by 28%.\n\n→ Next Step: Create area-wise delivery route maps and share with drivers on WhatsApp.`;
  }

  if (
    m.includes("shop") ||
    m.includes("dealer") ||
    m.includes("customer") ||
    m.includes("partner")
  ) {
    return `${module}\n\n🏪 DEALER & CUSTOMER RELATIONSHIP INTELLIGENCE:\n\n• Credit Limit Framework: New shops = ₹5,000 limit (3 months), established (1yr+) = ₹20,000-50,000, premium dealers = custom limits. Review quarterly.\n• Loyalty Strategy: Top 20% of shops generate 80% of revenue. Give them priority delivery, better rates, and personal attention from Owner.\n• Khata Management: Review Khata balances weekly. Shops with growing debt (>45 days) = credit hold. Shops consistently paying = increase credit limit as loyalty reward.\n• Churn Prevention: If a shop orders 30% less than usual, call them proactively. Competitor intrusion is the #1 reason — offer a temporary rate reduction of 3-5%.\n• New Shop Onboarding: First 3 orders = supervised credit, 4th+ = standard credit terms. Take shop photos and GST certificate at onboarding.\n\n→ Next Step: Identify your top 10 shops by volume and schedule a personal visit this week.`;
  }

  if (
    m.includes("quality") ||
    m.includes("compliance") ||
    m.includes("legal") ||
    m.includes("gst") ||
    m.includes("fssai")
  ) {
    return `${module}\n\n⚖️ LEGAL & COMPLIANCE INTELLIGENCE REPORT:\n\n• FSSAI Compliance Checklist: Annual license renewal, daily production logs, lab test reports (monthly), HACCP implementation, recall procedure documentation. Penalty for non-compliance: ₹2-10 lakh.\n• GST Requirements: Monthly GSTR-1 filing (by 11th), GSTR-3B (by 20th), quarterly GSTR-4 if turnover <1.5Cr. Use HSN code 2201 for packaged water.\n• Audit Readiness: Maintain 5-year records for all production batches, QR logs, invoices, and payments. Digital storage via cloud recommended.\n• Risk Assessment: BIS certification (IS 14543) mandatory for packaged drinking water. Conduct internal mock audits every 6 months.\n• Insurance Coverage: Product liability insurance (₹50 lakh minimum) protects against contamination claims. Review annually.\n\n→ Next Step: Schedule a compliance calendar review with a CA for the next quarter.`;
  }

  if (
    m.includes("team") ||
    m.includes("manager") ||
    m.includes("staff") ||
    m.includes("hr") ||
    m.includes("employee")
  ) {
    return `${module}\n\n👥 TEAM & OPERATIONS INTELLIGENCE:\n\n• KPI Framework: Production Manager — daily batch count, quality pass rate, downtime %; Delivery Manager — on-time delivery %, fuel cost per km; Sales Manager — collection rate, new shop additions.\n• Shift Performance Tracking: Compare shift-wise output weekly. Identify underperforming shifts — typically a training or equipment issue, not a people problem.\n• Attendance Impact: 1 absent worker = 8-12% production drop on that shift. Cross-train workers for at least 2 roles each to build resilience.\n• Incentive Structure: Tie 10% of monthly salary to KPI achievement. This improves productivity by 15-25% and reduces turnover.\n• Communication: Use the Team Chat for real-time coordination. Production + Delivery channel coordination reduces dispatch errors by 40%.\n\n→ Next Step: Set up weekly KPI review meetings with each manager (15 min each, Monday morning).`;
  }

  if (
    m.includes("water") ||
    m.includes("20l") ||
    m.includes("1l") ||
    m.includes("500ml") ||
    m.includes("product")
  ) {
    return `${module}\n\n💧 PRODUCT MIX & PRICING INTELLIGENCE:\n\n• Revenue Mix Optimization: 20L jars have lowest margin but highest volume. 1L and 500ml bottles have 2-3x higher margin per liter — increase their production proportion.\n• Pricing Strategy: Market price anchoring — price 5% below major brands (Bisleri/Kinley) but 10% above local unbranded. This positions Sidhivinayak Waters as premium-local.\n• Seasonal Demand: May-July = 40% higher demand. Pre-stock raw materials in April. October-December = 20% lower demand — reduce shift frequency to cut costs.\n• 20L Jar Deposits: ₹100-150 deposit per jar reduces theft by 85%. Track jars by QR code — lost jars cost ₹400-600 each.\n• New Product Opportunity: 200ml cups for institutions (schools, offices) have 60-70% higher margin and growing demand — consider adding this SKU.\n\n→ Next Step: Calculate your current revenue split across all SKUs and identify the highest-margin growth opportunity.`;
  }

  if (
    m.includes("report") ||
    m.includes("analytics") ||
    m.includes("dashboard") ||
    m.includes("forecast") ||
    m.includes("sales")
  ) {
    return `${module}\n\n📊 ANALYTICS & REPORTING INTELLIGENCE:\n\n• Weekly KPI Dashboard: Production volume vs target, revenue collected vs invoiced, delivery on-time %, inventory health score, cash position.\n• Monthly Review Checklist: P&L comparison (MoM + YoY), top 10 shops by revenue, product mix shift, raw material cost trend, headcount vs output ratio.\n• Predictive Indicators: Rising unpaid invoices = cash crunch in 30 days. Falling batch counts = equipment or supply issue. Shop order frequency drop = competition threat.\n• Forecasting Model: Base next month's production on this month's actual orders × seasonal factor (1.4 for summer, 0.8 for winter).\n• Early Warning System: If any single metric deviates >15% from target, investigate within 24 hours. Small issues compound into crises when ignored.\n\n→ Next Step: Set up a Monday 9AM weekly review ritual using the Reports module data.`;
  }

  // Default comprehensive factory health check
  return `${module}\n\n🧠 FACTORY HEALTH CHECK — 5 PILLARS ANALYSIS:\n\n• Pillar 1 — PRODUCTION: Track batch completion rate daily. Target: 90%+ of planned batches completed. Use QR system for full traceability — non-negotiable for FSSAI compliance.\n• Pillar 2 — CASH FLOW: Unpaid invoices > 20% of monthly revenue = risk zone. Review Khata balances every Monday morning. Cash is king for factory operations.\n• Pillar 3 — SUPPLY CHAIN: Never have fewer than 3 days of critical raw materials. Maintain 2+ suppliers per item. Surprise inspections of material quality monthly.\n• Pillar 4 — TEAM: Each manager should know their weekly KPIs without being asked. Strong managers = Owner can focus on growth, not firefighting.\n• Pillar 5 — GROWTH: Every month, track 1 new shop addition, 1 cost reduction initiative, 1 quality improvement. Compound growth from small consistent improvements.\n\n→ Which pillar do you want to deep-dive into? Ask me about production, cash flow, supply chain, team, or growth strategies.`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMsg {
  id: string;
  role: "user" | "ai";
  text: string;
  agentName?: string;
  timestamp: string;
  confidence?: number;
  typing?: boolean;
}

interface AgentState {
  xp: number;
  level: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTimestamp(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function getIntelligenceLevel(cycles: number): string {
  const idx = Math.min(Math.floor(cycles / 3), INTELLIGENCE_LEVELS.length - 1);
  return INTELLIGENCE_LEVELS[idx];
}

function loadAgentState(name: string): AgentState {
  try {
    const raw = localStorage.getItem(`ai_agent_xp_${name}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xp: 0, level: 1 };
}

function saveAgentState(name: string, state: AgentState) {
  localStorage.setItem(`ai_agent_xp_${name}`, JSON.stringify(state));
}

function loadPowerLevel(): number {
  const raw = localStorage.getItem("ai_power_level");
  return raw ? Number.parseInt(raw, 10) : 9000;
}

function loadCycles(): number {
  const raw = localStorage.getItem("ai_learning_cycles");
  return raw ? Number.parseInt(raw, 10) : 0;
}

// ─── Boot Sequence ────────────────────────────────────────────────────────────
function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "complete">("loading");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase("complete");
          setTimeout(onComplete, 600);
          return 100;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#0A0F1F" }}
    >
      {/* Neural net dots background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.75 0.13 188) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative z-10 text-center px-8 max-w-sm w-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            border: "2px solid oklch(0.75 0.13 188)",
            boxShadow: "0 0 30px oklch(0.75 0.13 188 / 0.5)",
          }}
        >
          <Cpu className="w-7 h-7" style={{ color: "oklch(0.75 0.13 188)" }} />
        </motion.div>

        <p
          className="text-xs font-bold tracking-[0.3em] mb-1"
          style={{ color: "oklch(0.75 0.13 188)" }}
        >
          RANA JI AI SYSTEMS
        </p>
        <p
          className="text-lg font-bold mb-6"
          style={{
            color: phase === "complete" ? "oklch(0.73 0.17 150)" : "white",
          }}
        >
          {phase === "loading"
            ? "INITIALIZING NEURAL NETWORK..."
            : "✅ BOOT COMPLETE — ALL SYSTEMS ONLINE"}
        </p>

        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "oklch(0.15 0.02 240)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                phase === "complete"
                  ? "oklch(0.73 0.17 150)"
                  : "oklch(0.75 0.13 188)",
              boxShadow:
                phase === "complete"
                  ? "0 0 10px oklch(0.73 0.17 150)"
                  : "0 0 10px oklch(0.75 0.13 188)",
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "oklch(0.5 0.05 240)" }}>
          {phase === "loading"
            ? `${progress}% — Loading neural modules...`
            : "Rana Ji AI v∞.0 ready"}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
function AgentCard({
  agent,
  state,
  onAsk,
  isThinking,
}: {
  agent: (typeof AGENT_DEFS)[0];
  state: AgentState;
  onAsk: () => void;
  isThinking: boolean;
}) {
  const [xpFlash, setXpFlash] = useState(false);
  const xpForLevel = ((state.xp % 5) / 5) * 100;

  const handleAsk = () => {
    if (isThinking) return;
    setXpFlash(true);
    setTimeout(() => setXpFlash(false), 600);
    onAsk();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 text-center relative overflow-hidden cursor-pointer"
      style={{
        background: "oklch(0.13 0.015 240)",
        border: "1px solid oklch(0.75 0.13 188 / 0.3)",
      }}
      onClick={handleAsk}
      whileTap={{ scale: 0.96 }}
    >
      {/* Scan line animation */}
      <motion.div
        className="absolute inset-x-0 h-0.5 opacity-30"
        style={{ background: "oklch(0.75 0.13 188)" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Level badge */}
      <div
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
        style={{
          background: "oklch(0.78 0.18 80)",
          color: "#000",
          boxShadow: xpFlash ? "0 0 12px oklch(0.78 0.18 80)" : "none",
          transition: "box-shadow 0.3s",
        }}
      >
        {state.level}
      </div>

      <div className="text-2xl mb-1.5">{agent.icon}</div>
      <p className="text-xs font-bold text-white leading-tight">{agent.name}</p>
      <p
        className="text-[10px] mt-0.5 leading-tight"
        style={{ color: "oklch(0.5 0.05 240)" }}
      >
        {agent.role}
      </p>

      {/* XP bar */}
      <div
        className="w-full h-1 rounded-full mt-2 overflow-hidden"
        style={{ background: "oklch(0.18 0.02 240)" }}
      >
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${xpForLevel}%` }}
          style={{
            background: "oklch(0.78 0.18 80)",
            boxShadow: "0 0 6px oklch(0.78 0.18 80 / 0.8)",
          }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Neural link status */}
      <div className="flex items-center justify-center gap-1 mt-2">
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          style={{
            background: "oklch(0.73 0.17 150)",
            boxShadow: "0 0 6px oklch(0.73 0.17 150)",
          }}
        />
        <span
          className="text-[9px] font-bold"
          style={{ color: "oklch(0.73 0.17 150)" }}
        >
          NEURAL LINK ACTIVE
        </span>
      </div>

      {/* XP flash overlay */}
      <AnimatePresence>
        {xpFlash && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ background: "oklch(0.78 0.18 80 / 0.15)" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, active: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    const INSTANT_AFTER = 200;
    const limit = text.length <= INSTANT_AFTER ? text.length : INSTANT_AFTER;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= limit) {
        clearInterval(iv);
        if (text.length > INSTANT_AFTER) {
          setDisplayed(text);
        }
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, active, speed]);

  return { displayed };
}

// ─── Chat Message Component ───────────────────────────────────────────────────
function AIChatMessage({ msg, isLatest }: { msg: ChatMsg; isLatest: boolean }) {
  const shouldAnimate = msg.role === "ai" && isLatest;
  const { displayed } = useTypewriter(msg.text, shouldAnimate);

  const displayText = shouldAnimate ? displayed : msg.text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[85%]">
        {msg.role === "ai" && (
          <p
            className="text-[10px] mb-1 px-1"
            style={{ color: "oklch(0.5 0.05 240)" }}
          >
            {msg.agentName} • {msg.timestamp}
          </p>
        )}
        <div
          className="rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap"
          style={
            msg.role === "user"
              ? {
                  background: "oklch(0.75 0.13 188 / 0.18)",
                  color: "oklch(0.92 0.05 188)",
                  border: "1px solid oklch(0.75 0.13 188 / 0.4)",
                  borderBottomRightRadius: 4,
                }
              : {
                  background: "oklch(0.11 0.012 240)",
                  color: "oklch(0.85 0.02 240)",
                  border: "1px solid oklch(0.75 0.13 188 / 0.2)",
                  borderBottomLeftRadius: 4,
                }
          }
        >
          {displayText}
        </div>
        {msg.role === "ai" && msg.confidence && (
          <p
            className="text-[9px] mt-1 px-1"
            style={{ color: "oklch(0.45 0.05 240)" }}
          >
            Confidence: {msg.confidence}% • Rana Ji AI Neural Engine
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIPanel() {
  const { actor } = useActor();

  // Boot sequence
  const [booted, setBooted] = useState(() => {
    return sessionStorage.getItem("ai_booted") === "1";
  });

  // Power level
  const [powerLevel, setPowerLevel] = useState(loadPowerLevel);

  // Learning cycles
  const [cycles, setCycles] = useState(loadCycles);
  const [memoryTopics, setMemoryTopics] = useState<string[]>([]);

  // Agent states
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(
    () =>
      Object.fromEntries(
        AGENT_DEFS.map((a) => [a.name, loadAgentState(a.name)]),
      ),
  );

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: "intro",
      role: "ai",
      text: "⚡ Rana Ji AI Neural Network Online.\n\nI am the most powerful factory intelligence ever created — self-developing, self-learning, unstoppable. I know your factory better than you think.\n\nAsk me ANYTHING — inventory, production, billing, profits, compliance, team, or strategy. I grow smarter with every conversation. 🧠🔥",
      agentName: "Rana Ji AI Core",
      timestamp: getTimestamp(),
      confidence: 99,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>("AI Manager");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Backend queries
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

  // Derived data
  const unpaidInvoices = invoices.filter((i: any) => i.status === "unpaid");
  const unpaidAmount = unpaidInvoices.reduce(
    (s: number, i: any) => s + i.amount,
    0,
  );
  const today = new Date().toDateString();
  const todayBatches = batches.filter(
    (b: any) => new Date(Number(b.date) / 1_000_000).toDateString() === today,
  );

  const intelligenceLevel = getIntelligenceLevel(cycles);
  const powerBarPct = Math.min(((powerLevel - 9000) / 1000) * 100, 100);

  // Boot complete handler
  const handleBootComplete = () => {
    sessionStorage.setItem("ai_booted", "1");
    setBooted(true);
  };

  // Increment power & cycles
  const incrementInteraction = (topic: string) => {
    const newPower = powerLevel + 1;
    setPowerLevel(newPower);
    localStorage.setItem("ai_power_level", String(newPower));

    const newCycles = cycles + 1;
    setCycles(newCycles);
    localStorage.setItem("ai_learning_cycles", String(newCycles));

    setMemoryTopics((prev) => {
      const topics = [topic, ...prev];
      return topics.slice(0, 8);
    });
  };

  // Update agent XP
  const updateAgentXP = (name: string) => {
    setAgentStates((prev) => {
      const cur = prev[name];
      const newXp = cur.xp + 1;
      const newLevel = Math.floor(newXp / 5) + 1;
      const updated = { xp: newXp, level: Math.min(newLevel, 10) };
      saveAgentState(name, updated);
      return { ...prev, [name]: updated };
    });
  };

  const sendMessage = (text?: string) => {
    const msgText = (text ?? chatInput).trim();
    if (!msgText || isThinking) return;
    setChatInput("");

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: msgText,
      timestamp: getTimestamp(),
    };
    setChatMessages((p) => [...p, userMsg]);
    setIsThinking(true);

    // Detect topic for memory
    const topicMap: [string, string][] = [
      ["inventory|stock|reorder", "📦 Inventory Management"],
      ["production|batch|shift", "🏭 Production Optimization"],
      ["billing|invoice|payment", "🧾 Cash Flow & Billing"],
      ["profit|revenue|loss|margin", "💰 Profit Analysis"],
      ["delivery|dispatch|logistics", "🚚 Delivery & Logistics"],
      ["shop|dealer|customer", "🏪 Shop Management"],
      ["compliance|legal|gst|fssai", "⚖️ Legal & Compliance"],
      ["team|manager|staff", "👥 Team Operations"],
      ["water|product|20l", "💧 Product Strategy"],
      ["report|analytics|forecast", "📊 Analytics & Reports"],
    ];
    const lower = msgText.toLowerCase();
    let topic = "🧠 Factory Intelligence";
    for (const [pattern, label] of topicMap) {
      if (new RegExp(pattern).test(lower)) {
        topic = label;
        break;
      }
    }

    incrementInteraction(topic);
    updateAgentXP(activeAgent);

    const delay = 900 + Math.random() * 700;
    setTimeout(() => {
      const agentDef =
        AGENT_DEFS.find((a) => a.name === activeAgent) ?? AGENT_DEFS[0];
      const agentLevel = agentStates[activeAgent]?.level ?? 1;
      const aiText = getAIResponse(msgText, activeAgent, agentLevel);
      const confidence = Math.floor(85 + Math.random() * 14);
      const aiMsg: ChatMsg = {
        id: `a-${Date.now()}`,
        role: "ai",
        text: aiText,
        agentName: `${agentDef.icon} ${activeAgent}`,
        timestamp: getTimestamp(),
        confidence,
      };
      setChatMessages((p) => [...p, aiMsg]);
      setIsThinking(false);
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }, delay);

    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const askAgent = (agentName: string) => {
    setActiveAgent(agentName);
    const topics: Record<string, string> = {
      "AI Manager":
        "What should I focus on for better operations management today?",
      "AI Analyst":
        "Give me a detailed sales trend analysis and demand forecast",
      "AI CA": "Analyze my profit margins and suggest optimization strategies",
      "AI Legal": "What compliance risks should I be aware of this month?",
      "AI Operations":
        "How can I optimize production efficiency and delivery operations?",
    };
    const text = topics[agentName] ?? `Tell me about ${agentName}`;
    sendMessage(text);
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: `intro-${Date.now()}`,
        role: "ai",
        text: "Neural memory cleared. Ready for new intelligence session. What would you like to analyze? 🧠",
        agentName: "Rana Ji AI Core",
        timestamp: getTimestamp(),
        confidence: 99,
      },
    ]);
  };

  // Proactive AI insights
  const predictions: { icon: string; text: string; color: string }[] = [];
  if (invoices.length > 0 && unpaidInvoices.length / invoices.length > 0.3) {
    predictions.push({
      icon: "⚠️",
      text: `Cash flow risk detected — ${unpaidInvoices.length} unpaid invoices (₹${unpaidAmount.toLocaleString("en-IN")}) need immediate collection follow-up`,
      color: "oklch(0.73 0.16 65)",
    });
  }
  if (todayBatches.length === 0 && batches.length > 0) {
    predictions.push({
      icon: "📉",
      text: "Production gap detected — no batches logged today. Check line status and shift schedule immediately.",
      color: "oklch(0.6 0.22 25)",
    });
  }
  if (lowStock.length > 0) {
    predictions.push({
      icon: "🔴",
      text: `Critical supply risk — ${lowStock.length} materials running low. Contact suppliers within 24 hours to avoid production halt.`,
      color: "oklch(0.6 0.22 25)",
    });
  }
  if (pendingDeliveries.length > 5) {
    predictions.push({
      icon: "🚚",
      text: `Delivery backlog alert — ${pendingDeliveries.length} pending dispatches. Customer satisfaction risk if not cleared today.`,
      color: "oklch(0.75 0.13 188)",
    });
  }
  if (predictions.length === 0) {
    predictions.push(
      {
        icon: "✅",
        text: "All systems operating normally — factory health score: EXCELLENT. Keep up the momentum!",
        color: "oklch(0.73 0.17 150)",
      },
      {
        icon: "📈",
        text: "Positive trend detected — consistent production and delivery patterns suggest strong operational maturity.",
        color: "oklch(0.73 0.17 150)",
      },
      {
        icon: "💡",
        text: "Growth opportunity: Review your top 10 shops for upsell potential — a 10% volume increase from existing customers is more profitable than acquiring new ones.",
        color: "oklch(0.75 0.13 188)",
      },
    );
  }

  const latestAiMsgId = [...chatMessages]
    .reverse()
    .find((m) => m.role === "ai")?.id;

  if (!booted) {
    return (
      <AnimatePresence>
        <BootSequence onComplete={handleBootComplete} />
      </AnimatePresence>
    );
  }

  return (
    <div
      className="space-y-5 relative"
      style={{
        backgroundImage:
          "radial-gradient(circle, oklch(0.75 0.13 188 / 0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <motion.div
          animate={{
            boxShadow: [
              "0 0 10px oklch(0.75 0.13 188 / 0.4)",
              "0 0 20px oklch(0.75 0.13 188 / 0.7)",
              "0 0 10px oklch(0.75 0.13 188 / 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "oklch(0.75 0.13 188 / 0.12)",
            border: "1px solid oklch(0.75 0.13 188 / 0.4)",
          }}
        >
          <Brain
            className="w-5 h-5"
            style={{ color: "oklch(0.75 0.13 188)" }}
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">AI Command Center</h1>
            {isLoading && (
              <Loader2
                className="w-3.5 h-3.5 animate-spin"
                style={{ color: "oklch(0.75 0.13 188)" }}
              />
            )}
            {/* Creator badge */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 8px oklch(0.78 0.18 80 / 0.5)",
                  "0 0 16px oklch(0.78 0.18 80 / 0.9)",
                  "0 0 8px oklch(0.78 0.18 80 / 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: "oklch(0.78 0.18 80 / 0.15)",
                border: "1px solid oklch(0.78 0.18 80 / 0.6)",
                color: "oklch(0.78 0.18 80)",
              }}
            >
              <Zap className="w-2.5 h-2.5" />
              Created by Rana Ji
            </motion.div>
          </div>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "oklch(0.5 0.05 240)" }}
          >
            Self-developing AI • Intelligence: {intelligenceLevel} • {cycles}{" "}
            learning cycles
          </p>
        </div>
      </div>

      {/* ── Power Level ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.13 0.015 240)",
          border: "1px solid oklch(0.78 0.18 80 / 0.3)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "oklch(0.78 0.18 80)" }} />
            <span
              className="text-xs font-bold"
              style={{ color: "oklch(0.78 0.18 80)" }}
            >
              POWER LEVEL
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              key={powerLevel}
              initial={{ scale: 1.3, color: "oklch(0.78 0.18 80)" }}
              animate={{ scale: 1, color: "white" }}
              className="text-lg font-bold"
            >
              {powerLevel.toLocaleString()}
            </motion.span>
            {powerLevel > 9001 && (
              <motion.span
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="text-xs font-bold"
                style={{ color: "oklch(0.78 0.18 80)" }}
              >
                OVER 9000! 🔥
              </motion.span>
            )}
          </div>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "oklch(0.18 0.02 240)" }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${Math.max(powerBarPct, 2)}%` }}
            style={{
              background:
                "linear-gradient(90deg, oklch(0.75 0.13 188), oklch(0.78 0.18 80))",
              boxShadow: "0 0 8px oklch(0.78 0.18 80 / 0.8)",
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span
            className="text-[10px]"
            style={{ color: "oklch(0.4 0.04 240)" }}
          >
            9000
          </span>
          <span
            className="text-[10px]"
            style={{ color: "oklch(0.4 0.04 240)" }}
          >
            10000+
          </span>
        </div>
      </motion.div>

      {/* ── Intelligence Panel ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 text-center"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.65 0.2 290 / 0.3)",
          }}
        >
          <Cpu
            className="w-4 h-4 mx-auto mb-1"
            style={{ color: "oklch(0.65 0.2 290)" }}
          />
          <p className="text-sm font-bold text-white">{intelligenceLevel}</p>
          <p className="text-[10px]" style={{ color: "oklch(0.5 0.05 240)" }}>
            Intelligence
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl p-3 text-center"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.73 0.17 150 / 0.3)",
          }}
        >
          <Activity
            className="w-4 h-4 mx-auto mb-1"
            style={{ color: "oklch(0.73 0.17 150)" }}
          />
          <p className="text-sm font-bold text-white">{cycles}</p>
          <p className="text-[10px]" style={{ color: "oklch(0.5 0.05 240)" }}>
            Learning Cycles
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-3 text-center"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.75 0.13 188 / 0.3)",
          }}
        >
          <Sparkles
            className="w-4 h-4 mx-auto mb-1"
            style={{ color: "oklch(0.75 0.13 188)" }}
          />
          <p className="text-sm font-bold text-white">
            {chatMessages.filter((m) => m.role === "ai").length}
          </p>
          <p className="text-[10px]" style={{ color: "oklch(0.5 0.05 240)" }}>
            AI Responses
          </p>
        </motion.div>
      </div>

      {/* ── Neural Memory Log ─────────────────────────────────── */}
      {memoryTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-4"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.65 0.2 290 / 0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-0.5 h-4 rounded-full"
              style={{ background: "oklch(0.65 0.2 290)" }}
            />
            <p
              className="text-xs font-bold"
              style={{ color: "oklch(0.65 0.2 290)" }}
            >
              NEURAL MEMORY LOG
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {memoryTopics.map((topic) => (
              <span
                key={topic}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.65 0.2 290 / 0.12)",
                  color: "oklch(0.65 0.2 290)",
                  border: "1px solid oklch(0.65 0.2 290 / 0.3)",
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── AI Agents ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-0.5 h-4 rounded-full"
            style={{ background: "oklch(0.75 0.13 188)" }}
          />
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "oklch(0.75 0.13 188)" }}
          >
            AI Agents — Tap to Activate
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {AGENT_DEFS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <AgentCard
                agent={agent}
                state={agentStates[agent.name]}
                onAsk={() => askAgent(agent.name)}
                isThinking={isThinking}
              />
            </motion.div>
          ))}
        </div>
        {/* Active agent indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="text-[10px]"
            style={{ color: "oklch(0.5 0.05 240)" }}
          >
            Active Agent:
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "oklch(0.75 0.13 188 / 0.15)",
              color: "oklch(0.75 0.13 188)",
            }}
          >
            {AGENT_DEFS.find((a) => a.name === activeAgent)?.icon} {activeAgent}
          </span>
        </div>
      </div>

      {/* ── Proactive AI Predictions ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-0.5 h-4 rounded-full"
            style={{ background: "oklch(0.73 0.16 65)" }}
          />
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "oklch(0.73 0.16 65)" }}
          >
            ⚡ AI Predictions
          </p>
        </div>
        <div className="space-y-2">
          {predictions.map((pred, i) => (
            <motion.div
              key={`${pred.text.slice(0, 20)}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl p-3 flex items-start gap-3"
              style={{
                background: `${pred.color.replace(")", " / 0.06)").replace("oklch(", "oklch(")}`,
                border: `1px solid ${pred.color.replace(")", " / 0.25)").replace("oklch(", "oklch(")}`,
              }}
            >
              <span className="text-base flex-shrink-0">{pred.icon}</span>
              <p
                className="text-xs leading-relaxed"
                style={{ color: pred.color }}
              >
                {pred.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── AI Assistant Chat ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-0.5 h-4 rounded-full"
              style={{ background: "oklch(0.75 0.13 188)" }}
            />
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.75 0.13 188)" }}
            >
              🤖 Neural Chat Interface
            </p>
          </div>
          <button
            type="button"
            data-ocid="ai.chat.close_button"
            onClick={clearChat}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-opacity hover:opacity-80"
            style={{
              background: "oklch(0.6 0.22 25 / 0.15)",
              color: "oklch(0.6 0.22 25)",
            }}
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "oklch(0.11 0.012 240)",
            border: "1px solid oklch(0.75 0.13 188 / 0.25)",
          }}
        >
          {/* Messages */}
          <div className="h-[350px] overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {chatMessages.map((msg) => (
                <AIChatMessage
                  key={msg.id}
                  msg={msg}
                  isLatest={msg.id === latestAiMsgId && msg.role === "ai"}
                />
              ))}
              {isThinking && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="rounded-xl px-4 py-3 flex gap-1 items-center"
                    style={{
                      background: "oklch(0.13 0.015 240)",
                      border: "1px solid oklch(0.75 0.13 188 / 0.2)",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.15,
                        }}
                        style={{
                          background: "oklch(0.75 0.13 188)",
                          display: "block",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Quick chips */}
          <div
            className="px-3 py-2 flex gap-1.5 overflow-x-auto"
            style={{ borderTop: "1px solid oklch(0.18 0.02 240)" }}
          >
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                data-ocid="ai.chat.button"
                onClick={() => sendMessage(chip.question)}
                disabled={isThinking}
                className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{
                  background: "oklch(0.75 0.13 188 / 0.1)",
                  color: "oklch(0.75 0.13 188)",
                  border: "1px solid oklch(0.75 0.13 188 / 0.25)",
                  whiteSpace: "nowrap",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="flex gap-2 p-3"
            style={{ borderTop: "1px solid oklch(0.18 0.02 240)" }}
          >
            <input
              ref={inputRef}
              data-ocid="ai.chat.input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask Rana Ji AI anything..."
              className="flex-1 bg-transparent text-xs text-white outline-none"
              style={
                {
                  "--tw-placeholder-opacity": "1",
                  color: "oklch(0.85 0.02 240)",
                } as any
              }
            />
            <button
              type="button"
              data-ocid="ai.send.button"
              onClick={() => sendMessage()}
              disabled={isThinking || !chatInput.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                background: "oklch(0.75 0.13 188)",
                boxShadow: chatInput.trim()
                  ? "0 0 12px oklch(0.75 0.13 188 / 0.5)"
                  : "none",
              }}
            >
              <Send className="w-3.5 h-3.5" style={{ color: "#000" }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer signature ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-2"
      >
        <p className="text-[10px]" style={{ color: "oklch(0.35 0.04 240)" }}>
          ⚡ Rana Ji AI Neural Engine v∞ • Self-developing • Always learning •
          Unstoppable
        </p>
      </motion.div>
    </div>
  );
}
