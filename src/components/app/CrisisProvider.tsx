"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CrisisOverlay } from "@/components/cockpit/CrisisOverlay";
import type { CrisisId } from "@/lib/data/crisisProtocols";

type CrisisContextValue = {
  open: boolean;
  activeId: CrisisId | null;
  openCrisis: (id?: CrisisId) => void;
  closeCrisis: () => void;
};

const CrisisContext = createContext<CrisisContextValue | null>(null);

export function CrisisProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<CrisisId | null>(null);

  const openCrisis = useCallback((id?: CrisisId) => {
    setActiveId(id ?? "si");
    setOpen(true);
  }, []);
  const closeCrisis = useCallback(() => setOpen(false), []);

  // Global hotkey: Ctrl/Cmd + Shift + C
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === "C" || e.key === "c")
      ) {
        e.preventDefault();
        setActiveId((id) => id ?? "si");
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({ open, activeId, openCrisis, closeCrisis }),
    [open, activeId, openCrisis, closeCrisis]
  );

  return (
    <CrisisContext.Provider value={value}>
      {children}
      <CrisisOverlay
        open={open}
        initialId={activeId}
        onClose={closeCrisis}
      />
    </CrisisContext.Provider>
  );
}

export function useCrisis(): CrisisContextValue {
  const ctx = useContext(CrisisContext);
  if (!ctx) {
    // Quietly degrade if used outside provider — no-op shape
    return {
      open: false,
      activeId: null,
      openCrisis: () => {},
      closeCrisis: () => {},
    };
  }
  return ctx;
}
