import React, { createContext, useContext, useState } from 'react';

type Settings = { orgName: string; logoUri?: string; accent?: string };
const Ctx = createContext<{ settings: Settings; setSettings: (s: Partial<Settings>)=>void } | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setState] = useState<Settings>({ orgName: 'Your Company', accent: '#2563EB' });
  const setSettings = (s: Partial<Settings>) => setState(prev => ({ ...prev, ...s }));
  return <Ctx.Provider value={{ settings, setSettings }}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
