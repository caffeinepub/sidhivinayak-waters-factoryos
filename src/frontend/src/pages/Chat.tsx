import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Hash,
  MessageCircle,
  Package,
  RefreshCw,
  Send,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface ChatMessage {
  id: bigint;
  sender: { toString: () => string };
  senderName: string;
  content: string;
  timestamp: bigint;
  channel: string;
}

const CHANNELS = [
  { id: "general", label: "General", icon: Hash },
  { id: "production", label: "Production", icon: Package },
  { id: "sales", label: "Sales", icon: ShoppingCart },
  { id: "delivery", label: "Delivery", icon: Truck },
];

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function scrollToBottom(ref: React.RefObject<HTMLDivElement | null>) {
  ref.current?.scrollIntoView({ behavior: "smooth" });
}

export default function Chat() {
  const { actor } = useActor();
  const { identity, login, isLoggingIn } = useInternetIdentity() as any;
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [senderName, setSenderName] = useState("User");
  const [showChannels, setShowChannels] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const myPrincipal = identity?.getPrincipal().toString();

  const loadMessages = useCallback(async () => {
    if (!actor) return;
    try {
      const msgs = await (actor as any).getRecentChatMessages(
        activeChannel,
        50n,
      );
      const sorted = [...(msgs as ChatMessage[])].sort((a, b) =>
        Number(a.timestamp - b.timestamp),
      );
      setMessages(sorted);
      setTimeout(() => scrollToBottom(bottomRef), 50);
    } catch {
      // ignore
    }
  }, [actor, activeChannel]);

  // Load profile name
  useEffect(() => {
    if (!actor || !identity) return;
    actor
      .getCallerUserProfile()
      .then((p) => {
        if (p?.name) setSenderName(p.name);
      })
      .catch(() => {});
  }, [actor, identity]);

  // Initial load + auto-refresh
  useEffect(() => {
    if (!identity) return;
    setLoading(true);
    loadMessages().finally(() => setLoading(false));
    const timer = setInterval(loadMessages, 4000);
    return () => clearInterval(timer);
  }, [loadMessages, identity]);

  const handleSend = async () => {
    if (!actor || !input.trim() || !identity) return;
    setSending(true);
    try {
      await (actor as any).sendChatMessage(
        activeChannel,
        input.trim(),
        senderName,
      );
      setInput("");
      await loadMessages();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeChannelData = CHANNELS.find((c) => c.id === activeChannel)!;

  if (!identity) {
    return (
      <div
        data-ocid="chat.section"
        className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6"
      >
        <div className="text-6xl">💬</div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Team Chat</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Login with Internet Identity to join the team chat
          </p>
          <button
            type="button"
            data-ocid="chat.login.button"
            onClick={login}
            disabled={isLoggingIn}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: "oklch(0.75 0.13 188)",
              color: "oklch(0.10 0.012 240)",
              boxShadow: "0 0 16px oklch(0.75 0.13 188 / 0.4)",
            }}
          >
            {isLoggingIn ? "Logging in..." : "Login to Chat"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="chat.section"
      className="flex h-[calc(100vh-10rem)] gap-0 rounded-xl overflow-hidden"
      style={{ border: "1px solid oklch(0.21 0.02 240)" }}
    >
      {/* Channel list */}
      <div
        className={`${
          showChannels ? "flex" : "hidden"
        } md:flex flex-col w-60 flex-shrink-0`}
        style={{
          background: "oklch(0.10 0.012 240)",
          borderRight: "1px solid oklch(0.21 0.02 240)",
        }}
      >
        <div
          className="px-4 py-4 border-b"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Channels
          </p>
        </div>
        <div className="flex-1 py-2 px-2 space-y-0.5">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isActive = ch.id === activeChannel;
            const unread =
              !isActive && messages.some((m) => m.channel === ch.id);
            return (
              <button
                type="button"
                key={ch.id}
                data-ocid={`chat.${ch.id}.tab`}
                onClick={() => {
                  setActiveChannel(ch.id);
                  setShowChannels(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all group"
                style={
                  isActive
                    ? {
                        background: "oklch(0.75 0.13 188 / 0.12)",
                        border: "1px solid oklch(0.75 0.13 188 / 0.3)",
                      }
                    : { border: "1px solid transparent" }
                }
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive
                      ? "text-neon"
                      : "text-tertiary group-hover:text-neon"
                  }`}
                />
                <span
                  className={`text-sm flex-1 ${
                    isActive
                      ? "font-semibold text-neon"
                      : "font-medium text-muted-custom group-hover:text-foreground"
                  }`}
                >
                  {ch.label}
                </span>
                {unread && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "oklch(0.75 0.13 188)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ background: "oklch(0.10 0.012 240)" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b flex-shrink-0"
          style={{ borderColor: "oklch(0.21 0.02 240)" }}
        >
          <button
            type="button"
            data-ocid="chat.channels.toggle"
            className="md:hidden p-1.5 rounded text-muted-foreground hover:text-neon"
            onClick={() => setShowChannels((v) => !v)}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <activeChannelData.icon className="w-4 h-4 text-neon" />
          <span className="font-semibold text-foreground text-sm">
            {activeChannelData.label}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            # {activeChannel}
          </span>
          <button
            type="button"
            data-ocid="chat.refresh.button"
            onClick={loadMessages}
            className="ml-auto p-1.5 rounded text-muted-foreground hover:text-neon transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          {loading && messages.length === 0 ? (
            <div
              data-ocid="chat.loading_state"
              className="flex flex-col gap-3 pt-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full animate-pulse flex-shrink-0"
                    style={{ background: "oklch(0.18 0.015 240)" }}
                  />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div
                      className="h-3 w-24 rounded animate-pulse"
                      style={{ background: "oklch(0.18 0.015 240)" }}
                    />
                    <div
                      className="h-8 rounded-lg animate-pulse"
                      style={{
                        background: "oklch(0.18 0.015 240)",
                        width: `${40 + i * 15}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div
              data-ocid="chat.empty_state"
              className="flex flex-col items-center justify-center py-20 gap-3"
            >
              <div className="text-4xl">👋</div>
              <p className="text-muted-foreground text-sm">
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isMe =
                    myPrincipal && msg.sender.toString() === myPrincipal;
                  return (
                    <motion.div
                      key={String(msg.id)}
                      data-ocid={`chat.item.${idx + 1}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`flex gap-2.5 ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{
                          background: isMe
                            ? "oklch(0.75 0.13 188 / 0.2)"
                            : "oklch(0.18 0.015 240)",
                          border: isMe
                            ? "1px solid oklch(0.75 0.13 188 / 0.5)"
                            : "1px solid oklch(0.25 0.02 240)",
                          color: isMe
                            ? "oklch(0.75 0.13 188)"
                            : "oklch(0.55 0.04 240)",
                        }}
                      >
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>

                      <div
                        className={`flex flex-col gap-0.5 max-w-[72%] ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`flex items-baseline gap-2 ${
                            isMe ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <span
                            className="text-xs font-bold"
                            style={{
                              color: isMe
                                ? "oklch(0.75 0.13 188)"
                                : "oklch(0.65 0.04 240)",
                            }}
                          >
                            {msg.senderName}
                          </span>
                          <span className="text-[10px] text-tertiary">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <div
                          className="px-3 py-2 rounded-2xl text-sm leading-relaxed break-words"
                          style={
                            isMe
                              ? {
                                  background: "oklch(0.75 0.13 188)",
                                  color: "oklch(0.10 0.012 240)",
                                  borderBottomRightRadius: "4px",
                                  boxShadow:
                                    "0 0 12px oklch(0.75 0.13 188 / 0.25)",
                                }
                              : {
                                  background: "oklch(0.16 0.014 240)",
                                  color: "oklch(0.85 0.02 240)",
                                  border: "1px solid oklch(0.22 0.02 240)",
                                  borderBottomLeftRadius: "4px",
                                }
                          }
                        >
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div
          className="px-4 py-3 border-t flex-shrink-0"
          style={{
            borderColor: "oklch(0.21 0.02 240)",
            background: "oklch(0.12 0.013 240)",
          }}
        >
          <div className="flex items-end gap-2">
            <textarea
              data-ocid="chat.textarea"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${activeChannel}...`}
              className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: "oklch(0.15 0.013 240)",
                border: "1px solid oklch(0.25 0.02 240)",
                color: "oklch(0.88 0.02 240)",
                minHeight: "42px",
                maxHeight: "120px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor =
                  "oklch(0.75 0.13 188 / 0.6)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.25 0.02 240)";
              }}
            />
            <button
              type="button"
              data-ocid="chat.send.button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all"
              style={{
                background:
                  sending || !input.trim()
                    ? "oklch(0.18 0.013 240)"
                    : "oklch(0.75 0.13 188)",
                color:
                  sending || !input.trim()
                    ? "oklch(0.40 0.02 240)"
                    : "oklch(0.10 0.012 240)",
                boxShadow:
                  !sending && input.trim()
                    ? "0 0 14px oklch(0.75 0.13 188 / 0.4)"
                    : "none",
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-tertiary mt-1.5 pl-1">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
