import { createContext, useContext, useEffect, useState } from "react";

export interface OwnerConfig {
  accentColor: string;
  hiddenPages: string[];
  customLabels: Record<string, string>;
  directives: { id: string; text: string; timestamp: string }[];
  ownerName: string;
}

const DEFAULT_CONFIG: OwnerConfig = {
  accentColor: "#00CFFF",
  hiddenPages: [],
  customLabels: {},
  directives: [],
  ownerName: "Rana Ji",
};

const STORAGE_KEY = "sw_owner_config";

interface OwnerContextValue {
  config: OwnerConfig;
  updateConfig: (patch: Partial<OwnerConfig>) => void;
}

const OwnerContext = createContext<OwnerContextValue>({
  config: DEFAULT_CONFIG,
  updateConfig: () => {},
});

export function OwnerProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<OwnerConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (patch: Partial<OwnerConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  return (
    <OwnerContext.Provider value={{ config, updateConfig }}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  return useContext(OwnerContext);
}
