"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Preferences } from "@capacitor/preferences";
import { Session } from "@supabase/supabase-js"; // Import the Session type

// Define types
interface AuthContextType {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

// Create AuthContext with correct default value
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const { value } = await Preferences.get({ key: "user_session" });
      if (value) {
        const storedSession: Session = JSON.parse(value);
        await supabase.auth.setSession(storedSession);
        setSession(storedSession);
      }
    };

    restoreSession();
  }, []);

  return <AuthContext.Provider value={{ session, setSession }}>{children}</AuthContext.Provider>;
}

// Custom hook to use AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
