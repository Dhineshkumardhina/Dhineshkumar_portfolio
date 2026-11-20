"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultPortfolio, type PortfolioData } from "@/data/portfolio";

interface PortfolioContextValue {
  portfolio: PortfolioData;
  setPortfolio: (data: PortfolioData) => void;
}

const PortfolioContext = createContext<PortfolioContextValue>({
  portfolio: defaultPortfolio,
  setPortfolio: () => {},
});

const CHANNEL_NAME = "dhina-portfolio-sync";

export function PortfolioProvider({
  initialData,
  children,
}: {
  initialData: PortfolioData;
  children: ReactNode;
}) {
  const [portfolio, setPortfolio] = useState<PortfolioData>(initialData);

  // Sync whenever Server Component passes fresh initialData
  useEffect(() => {
    setPortfolio(initialData);
  }, [initialData]);

  // Real-time cross-tab sync when saving in /dhina (even without manual reload!)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === "PORTFOLIO_UPDATED" && event.data?.payload) {
          setPortfolio(event.data.payload as PortfolioData);
        }
      };
    }

    const refreshFromApi = async () => {
      try {
        const res = await fetch("/api/portfolio", { cache: "no-store" });
        if (res.ok) {
          const latest = (await res.json()) as PortfolioData;
          setPortfolio(latest);
        }
      } catch {
        // Ignore transient network errors
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshFromApi();
      }
    };

    window.addEventListener("focus", refreshFromApi);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      channel?.close();
      window.removeEventListener("focus", refreshFromApi);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <PortfolioContext.Provider value={{ portfolio, setPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioData {
  return useContext(PortfolioContext).portfolio;
}
