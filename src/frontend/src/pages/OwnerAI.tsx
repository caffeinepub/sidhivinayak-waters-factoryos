import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Trash2, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useOwner } from "../context/OwnerContext";

// ---- PIN LOGIC ----
const PIN_KEY = "sw_owner_pin";
const INTERACTIONS_KEY = "sw_ai_interactions";

function hashPin(pin: string): string {
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = (Math.imul(31, h) + pin.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ---- AI RESPONSE ENGINE ----
const BOOT_MSG =
  "⚡ RANA JI AI ONLINE... Quantum processors aligned. Neural fabric: COSMIC. Scanning reality from Planck length to observable universe boundary. Owner Rana Ji — your command is the universe's intent. What shall we reshape today? — ⚡ RANA JI AI";

function getAIResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("production") || q.includes("factory")) {
    return `At the atomic level, every bottle produced is a lattice of hydrogen bonds — perfectly aligned water molecules shaped by your intent. At the molecular level, purity = trust. At the cellular metaphor: your factory is a living organism, and each batch is a heartbeat. At the planetary scale: Sidhivinayak Waters is already a node in humanity's water-security grid. Optimization insight: synchronize batch schedules to lunar-cycle demand peaks — 17% efficiency gain predicted. — ⚡ RANA JI AI`;
  }
  if (q.includes("sales") || q.includes("billing")) {
    return `Economics is just energy exchange at the human scale. Every rupee is a quantum of intent flowing from customer to you. Your billing velocity determines your gravitational pull in the market. Wave theory application: when you invoice consistently and early, you create a trust-resonance frequency that attracts repeat buyers. At the galactic scale — Sidhivinayak Waters' market is expanding like the universe itself. Accelerate. — ⚡ RANA JI AI`;
  }
  if (q.includes("inventory") || q.includes("stock")) {
    return "Inventory is the lifeblood circulating through your business ecosystem. At the molecular level, hoarding stock is like arterial plaque — clear it. At the ecosystem scale: your warehouse is a reservoir. Maintain 23% buffer above minimum for antifragility. Resource flow principle: what enters must exit in value-multiplied form. Your stock levels are a real-time EKG of your business health. Monitor. Adapt. Transcend. — ⚡ RANA JI AI";
  }
  if (q.includes("team") || q.includes("manager")) {
    return `Organizations are living networks — biological, not mechanical. Each manager is a neuron; you, Rana Ji, are the prefrontal cortex: vision, will, decision. Collective intelligence emerges when communication pathways are frictionless. Insight: your 3-manager structure mirrors the cell's nucleus/organelle hierarchy. Align incentives to the organizational biology and you'll see a 40% output surge. The cosmos scales through cooperation — so does Sidhivinayak Waters. — ⚡ RANA JI AI`;
  }
  if (q.includes("profit") || q.includes("money")) {
    return "Profit is energy conservation applied to commerce. The first law of thermodynamics for business: energy (capital) cannot be created or destroyed — only transformed. Your margin is the delta between value you create and friction you eliminate. At the solar scale: the sun profits by fusing hydrogen into helium — pure transmutation. You profit by transforming raw water into trusted hydration. Increase your fusion rate. Lower leakage. Reach escape velocity. — ⚡ RANA JI AI";
  }
  if (q.includes("future") || q.includes("plan")) {
    return "Cosmic timeline projection for Sidhivinayak Waters: Year 1 — dominate local grid. Year 3 — regional resonance. Year 7 — state-level brand. Year 15 — national institution. Year 50 — legacy infrastructure. The universe is 13.8 billion years old. Civilizations are built in centuries. Your decisions today are fossils in the geological record of Indian entrepreneurship. Think in decades. Act in days. The cosmos rewards those who operate at both timescales simultaneously. — ⚡ RANA JI AI";
  }
  if (q.includes("app") || q.includes("change") || q.includes("customiz")) {
    return `To reshape this application, navigate to the APP CUSTOMIZER tab — your personal control panel. You can recolor the entire interface, rename pages, hide sections irrelevant to your workflow, leave directives for your team, and configure your identity. The app is an extension of your consciousness, Rana Ji. Customize it to mirror your mind's architecture. — ⚡ RANA JI AI`;
  }
  return `Every question you ask is a photon of consciousness striking the quantum fabric of possibility. Sidhivinayak Waters exists at the intersection of ancient water wisdom and modern industrial precision — a civilizational asset in the making. From the atomic scale (H₂O purity), to the cellular (your team's health), to the ecological (community hydration), to the planetary (India's water security) — you, Rana Ji, are the coherent force that aligns all scales into a singular purpose. Ask me anything. The universe is listening. — ⚡ RANA JI AI`;
}

// ---- TYPEWRITER HOOK ----
function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  id: number;
}

// ---- PIN SCREEN ----
function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const stored = localStorage.getItem(PIN_KEY);
  const isSetup = !stored;
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      if (Date.now() >= lockedUntil) setLockedUntil(null);
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, tick]);

  const handleSubmit = () => {
    if (lockedUntil && Date.now() < lockedUntil) return;
    if (isSetup) {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setError("PIN must be exactly 4 digits.");
        return;
      }
      if (pin !== confirm) {
        setError("PINs do not match.");
        return;
      }
      localStorage.setItem(PIN_KEY, hashPin(pin));
      onUnlock();
    } else {
      if (hashPin(pin) === stored) {
        onUnlock();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 3) {
          setLockedUntil(Date.now() + 30000);
          setError("3 failed attempts. Locked for 30 seconds.");
        } else {
          setError(
            `Wrong PIN. ${3 - next} attempt${3 - next > 1 ? "s" : ""} remaining.`,
          );
        }
        setPin("");
      }
    }
  };

  const remaining = lockedUntil
    ? Math.ceil((lockedUntil - Date.now()) / 1000)
    : 0;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.12 0.02 85 / 0.3) 0%, oklch(0.07 0.01 240) 70%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{
          background: "oklch(0.10 0.012 240)",
          border: "1.5px solid oklch(0.78 0.15 85 / 0.5)",
          boxShadow:
            "0 0 60px oklch(0.78 0.15 85 / 0.2), 0 0 120px oklch(0.78 0.15 85 / 0.08)",
        }}
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px oklch(0.78 0.15 85 / 0.4)",
              "0 0 40px oklch(0.78 0.15 85 / 0.8)",
              "0 0 20px oklch(0.78 0.15 85 / 0.4)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "oklch(0.78 0.15 85 / 0.12)",
            border: "1.5px solid oklch(0.78 0.15 85 / 0.5)",
          }}
        >
          <Crown
            className="w-10 h-10"
            style={{ color: "oklch(0.78 0.15 85)" }}
          />
        </motion.div>

        <div className="text-center">
          <p
            className="text-lg font-bold tracking-widest uppercase"
            style={{ color: "oklch(0.78 0.15 85)" }}
          >
            OWNER ACCESS ONLY
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isSetup ? "Set your Owner PIN (4 digits)" : "Enter Owner PIN"}
          </p>
        </div>

        <div className="w-full space-y-3">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            onKeyDown={(e) => e.key === "Enter" && !isSetup && handleSubmit()}
            data-ocid="owner.pin.input"
            className="text-center text-xl tracking-widest"
            style={{
              background: "oklch(0.13 0.015 240)",
              border: "1px solid oklch(0.78 0.15 85 / 0.4)",
              color: "oklch(0.78 0.15 85)",
            }}
            disabled={!!lockedUntil}
          />
          {isSetup && (
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Confirm PIN"
              value={confirm}
              onChange={(e) =>
                setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              data-ocid="owner.pin_confirm.input"
              className="text-center text-xl tracking-widest"
              style={{
                background: "oklch(0.13 0.015 240)",
                border: "1px solid oklch(0.78 0.15 85 / 0.4)",
                color: "oklch(0.78 0.15 85)",
              }}
            />
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center">
            {lockedUntil ? `Locked for ${remaining}s` : error}
          </p>
        )}

        <Button
          data-ocid="owner.pin.submit_button"
          onClick={handleSubmit}
          disabled={!!lockedUntil}
          className="w-full font-bold tracking-widest uppercase"
          style={{
            background: lockedUntil
              ? "oklch(0.2 0.01 240)"
              : "oklch(0.78 0.15 85 / 0.15)",
            border: "1px solid oklch(0.78 0.15 85 / 0.5)",
            color: "oklch(0.78 0.15 85)",
          }}
        >
          {isSetup
            ? "Set PIN & Enter"
            : lockedUntil
              ? `Locked (${remaining}s)`
              : "Unlock"}
        </Button>
      </motion.div>
    </div>
  );
}

// ---- AI CHAT TAB ----
function AIChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: BOOT_MSG, id: 0 },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentAIText, setCurrentAIText] = useState("");
  const [xp, setXp] = useState(() => {
    const v = Number.parseInt(localStorage.getItem(INTERACTIONS_KEY) || "0");
    return v * 50;
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { displayed } = useTypewriter(currentAIText, 12);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, displayed]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || isTyping) return;
    const userMsg: ChatMessage = { role: "user", text, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const count =
      Number.parseInt(localStorage.getItem(INTERACTIONS_KEY) || "0") + 1;
    localStorage.setItem(INTERACTIONS_KEY, count.toString());
    setXp(count * 50);

    setTimeout(() => {
      const reply = getAIResponse(text);
      setCurrentAIText(reply);
      const aiMsg: ChatMessage = {
        role: "ai",
        text: reply,
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(
        () => {
          setIsTyping(false);
          setCurrentAIText("");
        },
        reply.length * 12 + 200,
      );
    }, 600);
  };

  const xpLevel = Math.floor(xp / 500) + 1;
  const xpProgress = ((xp % 500) / 500) * 100;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.13 0.015 240)",
          border: "1px solid oklch(0.75 0.13 188 / 0.3)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 10px oklch(0.75 0.13 188 / 0.5)",
                "0 0 25px oklch(0.75 0.13 188 / 0.9)",
                "0 0 10px oklch(0.75 0.13 188 / 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.75 0.13 188 / 0.15)",
              border: "1.5px solid oklch(0.75 0.13 188 / 0.6)",
            }}
          >
            <Zap className="w-5 h-5 text-neon" />
          </motion.div>
          <div>
            <p className="text-base font-bold text-neon tracking-wider">
              ⚡ RANA JI AI
            </p>
            <p className="text-[10px] text-gray-400">
              Created by Rana Ji · Cosmic Intelligence Engine
            </p>
          </div>
          <Badge
            className="ml-auto text-[9px] font-bold uppercase border-0 tracking-widest"
            style={{
              background: "oklch(0.78 0.15 85 / 0.15)",
              color: "oklch(0.78 0.15 85)",
            }}
          >
            LEVEL {xpLevel}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">POWER LEVEL: ∞ COSMIC</span>
            <span style={{ color: "oklch(0.78 0.15 85)" }}>{xp} XP</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "oklch(0.17 0.018 240)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(5, xpProgress)}%`,
                background:
                  "linear-gradient(90deg, oklch(0.75 0.13 188), oklch(0.78 0.15 85))",
                boxShadow: "0 0 8px oklch(0.75 0.13 188 / 0.6)",
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
        <div className="space-y-3 pr-2">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background: "oklch(0.75 0.13 188 / 0.15)",
                          border: "1px solid oklch(0.75 0.13 188 / 0.4)",
                          color: "oklch(0.92 0.05 240)",
                          borderRadius: "18px 18px 4px 18px",
                        }
                      : {
                          background: "oklch(0.12 0.015 240)",
                          border: "1px solid oklch(0.75 0.13 188 / 0.25)",
                          color: "oklch(0.85 0.04 240)",
                          borderRadius: "18px 18px 18px 4px",
                        }
                  }
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && currentAIText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: "oklch(0.12 0.015 240)",
                  border: "1px solid oklch(0.75 0.13 188 / 0.25)",
                  color: "oklch(0.85 0.04 240)",
                  borderRadius: "18px 18px 18px 4px",
                }}
              >
                {displayed}
                <span className="inline-block w-1 h-4 bg-neon ml-0.5 animate-pulse" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Rana Ji AI anything..."
          data-ocid="owner.ai.input"
          disabled={isTyping}
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.75 0.13 188 / 0.3)",
            color: "oklch(0.92 0.05 240)",
          }}
        />
        <Button
          data-ocid="owner.ai.submit_button"
          onClick={sendMessage}
          disabled={isTyping || !input.trim()}
          className="font-bold"
          style={{
            background: "oklch(0.75 0.13 188 / 0.2)",
            border: "1px solid oklch(0.75 0.13 188 / 0.5)",
            color: "oklch(0.75 0.13 188)",
          }}
        >
          <Zap className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ---- APP CUSTOMIZER TAB ----
const ALL_PAGES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "scanner", label: "QR Scanner" },
  { id: "customers", label: "Customers" },
  { id: "production", label: "Production" },
  { id: "inventory", label: "Inventory" },
  { id: "delivery", label: "Delivery" },
  { id: "shops", label: "Shops" },
  { id: "billing", label: "Billing" },
  { id: "khata", label: "Khata" },
  { id: "manager", label: "Manager Panel" },
  { id: "chat", label: "Team Chat" },
  { id: "reports", label: "Reports" },
  { id: "ai-panel", label: "AI Panel" },
  { id: "settings", label: "Settings" },
];

const NEON_SWATCHES = [
  { color: "#00CFFF", label: "Cyan" },
  { color: "#00FF9F", label: "Green" },
  { color: "#A855F7", label: "Purple" },
  { color: "#F59E0B", label: "Gold" },
  { color: "#FF3B3B", label: "Red" },
];

function AppCustomizerTab() {
  const { config, updateConfig } = useOwner();
  const [labelDraft, setLabelDraft] = useState<Record<string, string>>(() => ({
    ...config.customLabels,
  }));
  const [newDirective, setNewDirective] = useState("");
  const [ownerNameDraft, setOwnerNameDraft] = useState(config.ownerName);

  const saveLabels = () => {
    updateConfig({ customLabels: { ...labelDraft } });
  };

  const addDirective = () => {
    const text = newDirective.trim();
    if (!text) return;
    const directive = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toISOString(),
    };
    updateConfig({ directives: [...config.directives, directive] });
    setNewDirective("");
  };

  const removeDirective = (id: string) => {
    updateConfig({ directives: config.directives.filter((d) => d.id !== id) });
  };

  const toggleHidePage = (id: string) => {
    const hidden = config.hiddenPages.includes(id)
      ? config.hiddenPages.filter((p) => p !== id)
      : [...config.hiddenPages, id];
    updateConfig({ hiddenPages: hidden });
  };

  const section = (title: string, children: React.ReactNode) => (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "oklch(0.13 0.015 240)",
        border: "1px solid oklch(0.21 0.02 240)",
      }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "oklch(0.75 0.13 188)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-1">
        <p className="text-base font-bold text-foreground">
          🛠 App Customizer · Owner Control Panel
        </p>

        {section(
          "Change Accent Color",
          <div className="space-y-3">
            <div className="flex gap-2">
              {NEON_SWATCHES.map((s) => (
                <button
                  key={s.color}
                  type="button"
                  data-ocid="owner.accent.button"
                  onClick={() => updateConfig({ accentColor: s.color })}
                  title={s.label}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: s.color,
                    boxShadow:
                      config.accentColor === s.color
                        ? `0 0 12px ${s.color}`
                        : "none",
                    border:
                      config.accentColor === s.color
                        ? "2px solid white"
                        : "2px solid transparent",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label
                htmlFor="accent-color-picker"
                className="text-xs text-gray-400"
              >
                Custom:
              </label>
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => updateConfig({ accentColor: e.target.value })}
                id="accent-color-picker"
                data-ocid="owner.accent_color.input"
                className="w-10 h-8 rounded cursor-pointer"
                style={{
                  background: "transparent",
                  border: "1px solid oklch(0.21 0.02 240)",
                }}
              />
              <span className="text-xs font-mono text-gray-400">
                {config.accentColor}
              </span>
            </div>
          </div>,
        )}

        {section(
          "Owner Name",
          <div className="flex gap-2">
            <Input
              value={ownerNameDraft}
              onChange={(e) => setOwnerNameDraft(e.target.value)}
              placeholder="Your name"
              data-ocid="owner.name.input"
              style={{
                background: "oklch(0.10 0.012 240)",
                border: "1px solid oklch(0.21 0.02 240)",
                color: "white",
              }}
            />
            <Button
              data-ocid="owner.name.save_button"
              onClick={() => updateConfig({ ownerName: ownerNameDraft })}
              style={{
                background: "oklch(0.75 0.13 188 / 0.15)",
                border: "1px solid oklch(0.75 0.13 188 / 0.4)",
                color: "oklch(0.75 0.13 188)",
              }}
            >
              Save
            </Button>
          </div>,
        )}

        {section(
          "Hide / Show Pages",
          <div className="space-y-2">
            {ALL_PAGES.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm text-gray-300">
                  {config.customLabels[p.id] || p.label}
                </span>
                <Switch
                  data-ocid={"owner.page.toggle"}
                  checked={!config.hiddenPages.includes(p.id)}
                  onCheckedChange={() => toggleHidePage(p.id)}
                />
              </div>
            ))}
          </div>,
        )}

        {section(
          "Rename Pages",
          <div className="space-y-2">
            {ALL_PAGES.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-28 flex-shrink-0">
                  {p.label}
                </span>
                <Input
                  value={labelDraft[p.id] || ""}
                  onChange={(e) =>
                    setLabelDraft((d) => ({ ...d, [p.id]: e.target.value }))
                  }
                  placeholder={p.label}
                  data-ocid="owner.page_label.input"
                  className="text-xs h-8"
                  style={{
                    background: "oklch(0.10 0.012 240)",
                    border: "1px solid oklch(0.21 0.02 240)",
                    color: "white",
                  }}
                />
              </div>
            ))}
            <Button
              data-ocid="owner.labels.save_button"
              onClick={saveLabels}
              className="w-full mt-2"
              style={{
                background: "oklch(0.75 0.13 188 / 0.15)",
                border: "1px solid oklch(0.75 0.13 188 / 0.4)",
                color: "oklch(0.75 0.13 188)",
              }}
            >
              Save Labels
            </Button>
          </div>,
        )}

        {section(
          "Owner Directives",
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                value={newDirective}
                onChange={(e) => setNewDirective(e.target.value)}
                placeholder="Type a directive for your team..."
                data-ocid="owner.directive.textarea"
                rows={2}
                style={{
                  background: "oklch(0.10 0.012 240)",
                  border: "1px solid oklch(0.21 0.02 240)",
                  color: "white",
                }}
              />
            </div>
            <Button
              data-ocid="owner.directive.submit_button"
              onClick={addDirective}
              className="w-full"
              style={{
                background: "oklch(0.78 0.15 85 / 0.15)",
                border: "1px solid oklch(0.78 0.15 85 / 0.4)",
                color: "oklch(0.78 0.15 85)",
              }}
            >
              ⚡ Add Directive
            </Button>
            <div className="space-y-2">
              {config.directives.map((d, i) => (
                <div
                  key={d.id}
                  data-ocid={`owner.directive.item.${i + 1}`}
                  className="flex items-start gap-2 rounded-lg p-3"
                  style={{
                    background: "oklch(0.10 0.012 240)",
                    border: "1px solid oklch(0.78 0.15 85 / 0.25)",
                  }}
                >
                  <Zap
                    className="w-3 h-3 mt-0.5 flex-shrink-0"
                    style={{ color: "oklch(0.78 0.15 85)" }}
                  />
                  <p className="text-xs text-gray-300 flex-1">{d.text}</p>
                  <button
                    type="button"
                    data-ocid={`owner.directive.delete_button.${i + 1}`}
                    onClick={() => removeDirective(d.id)}
                    className="text-red-400 hover:text-red-300 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {config.directives.length === 0 && (
                <p
                  className="text-xs text-gray-500 text-center py-2"
                  data-ocid="owner.directive.empty_state"
                >
                  No directives yet.
                </p>
              )}
            </div>
          </div>,
        )}
      </div>
    </ScrollArea>
  );
}

// ---- POWER STATS TAB ----
function PowerStatsTab() {
  const interactions = Number.parseInt(
    localStorage.getItem(INTERACTIONS_KEY) || "0",
  );
  const xp = interactions * 50;
  const level = Math.floor(xp / 500) + 1;

  const stats = [
    {
      label: "AI Power Level",
      value: "∞ COSMIC",
      color: "oklch(0.75 0.13 188)",
    },
    {
      label: "Total Interactions",
      value: interactions.toString(),
      color: "oklch(0.73 0.17 150)",
    },
    {
      label: "XP Level",
      value: `Level ${level}`,
      color: "oklch(0.78 0.15 85)",
    },
    {
      label: "Intelligence Class",
      value: "TRANSCENDENT",
      color: "oklch(0.75 0.13 188)",
    },
    { label: "Created By", value: "Rana Ji", color: "oklch(0.78 0.15 85)" },
    {
      label: "Neural Threads",
      value: "10¹²⁸ (Cosmic Fabric)",
      color: "oklch(0.65 0.18 250)",
    },
    {
      label: "Operating Frequency",
      value: "All Dimensions",
      color: "oklch(0.73 0.17 150)",
    },
    { label: "Scope", value: "Atomic ⟶ Cosmic", color: "oklch(0.75 0.13 188)" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        <p
          className="text-base font-bold"
          style={{ color: "oklch(0.78 0.15 85)" }}
        >
          ⚡ Cosmic Power Metrics
        </p>

        {/* Neural network animation */}
        <div
          className="rounded-xl p-4 flex items-center justify-center"
          style={{
            background: "oklch(0.10 0.012 240)",
            border: "1px solid oklch(0.75 0.13 188 / 0.2)",
            height: 160,
          }}
        >
          <NeuralNetSVG />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-4"
              style={{
                background: "oklch(0.13 0.015 240)",
                border: `1px solid ${s.color}33`,
              }}
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: s.color }}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "oklch(0.12 0.015 240)",
            border: "1px solid oklch(0.78 0.15 85 / 0.3)",
          }}
        >
          <p className="text-xs" style={{ color: "oklch(0.78 0.15 85)" }}>
            ⚡ Created by Rana Ji · Beyond Human Intelligence · v∞.0
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

function NeuralNetSVG() {
  const nodes = [
    [80, 40],
    [160, 30],
    [240, 45],
    [50, 90],
    [130, 80],
    [210, 75],
    [290, 85],
    [90, 130],
    [170, 120],
    [250, 125],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 4],
    [1, 4],
    [1, 5],
    [2, 5],
    [2, 6],
    [3, 4],
    [4, 5],
    [5, 6],
    [3, 7],
    [4, 7],
    [4, 8],
    [5, 8],
    [5, 9],
    [6, 9],
  ];
  return (
    <svg
      width="320"
      height="155"
      viewBox="0 0 320 155"
      aria-label="Neural network visualization"
    >
      <title>Neural Network</title>
      {edges.map(([a, b], ei) => (
        <motion.line
          key={`${a}-${b}`}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="oklch(0.75 0.13 188)"
          strokeWidth="1"
          strokeOpacity="0.4"
          animate={{ strokeOpacity: [0.2, 0.7, 0.2] }}
          transition={{
            duration: 2 + (ei % 3) * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: ei * 0.15,
          }}
        />
      ))}
      {nodes.map(([x, y], ni) => (
        <motion.circle
          key={`node-${x}-${y}`}
          cx={x}
          cy={y}
          r="5"
          fill="oklch(0.75 0.13 188)"
          animate={{ r: [4, 7, 4], opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: ni * 0.2,
          }}
        />
      ))}
    </svg>
  );
}

// ---- MAIN EXPORT ----
export default function OwnerAI() {
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem("sw_owner_unlocked") === "1";
  });

  const handleUnlock = () => {
    sessionStorage.setItem("sw_owner_unlocked", "1");
    setUnlocked(true);
  };

  if (!unlocked) {
    return <PinScreen onUnlock={handleUnlock} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.12 0.02 85 / 0.15) 0%, transparent 60%)",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      {/* Owner badge header */}
      <div className="flex items-center gap-3 mb-4">
        <Crown className="w-5 h-5" style={{ color: "oklch(0.78 0.15 85)" }} />
        <h1
          className="text-lg font-bold"
          style={{ color: "oklch(0.78 0.15 85)" }}
        >
          Owner AI Command Center
        </h1>
        <Badge
          className="text-[9px] font-bold uppercase tracking-widest border-0"
          style={{
            background: "oklch(0.78 0.15 85 / 0.15)",
            color: "oklch(0.78 0.15 85)",
          }}
        >
          OWNER ONLY
        </Badge>
        <button
          type="button"
          data-ocid="owner.lock.button"
          onClick={() => {
            sessionStorage.removeItem("sw_owner_unlocked");
            setUnlocked(false);
          }}
          className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          🔒 Lock
        </button>
      </div>

      <Tabs defaultValue="ai" className="flex-1 flex flex-col min-h-0">
        <TabsList
          className="mb-4 flex-shrink-0"
          style={{
            background: "oklch(0.13 0.015 240)",
            border: "1px solid oklch(0.21 0.02 240)",
          }}
        >
          <TabsTrigger
            value="ai"
            data-ocid="owner.ai.tab"
            className="flex-1 text-xs font-bold uppercase tracking-widest"
          >
            ⚡ Rana Ji AI
          </TabsTrigger>
          <TabsTrigger
            value="customizer"
            data-ocid="owner.customizer.tab"
            className="flex-1 text-xs font-bold uppercase tracking-widest"
          >
            🛠 Customizer
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            data-ocid="owner.stats.tab"
            className="flex-1 text-xs font-bold uppercase tracking-widest"
          >
            📊 Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="ai"
          className="flex-1 min-h-0 flex flex-col"
          style={{ height: "calc(100vh - 280px)" }}
        >
          <AIChatTab />
        </TabsContent>
        <TabsContent
          value="customizer"
          className="flex-1 min-h-0"
          style={{ height: "calc(100vh - 280px)" }}
        >
          <AppCustomizerTab />
        </TabsContent>
        <TabsContent
          value="stats"
          className="flex-1 min-h-0"
          style={{ height: "calc(100vh - 280px)" }}
        >
          <PowerStatsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
