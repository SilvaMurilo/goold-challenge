'use client';
import { createContext, useContext, useState } from 'react';

const Ctx = createContext<any>(null);
export function SessionProvider({ initial, children }: { initial: any, children: React.ReactNode }) {
  const [session, setSession] = useState(initial);
  return <Ctx.Provider value={{ session, setSession }}>{children}</Ctx.Provider>;
}
export function useSession() { return useContext(Ctx); }