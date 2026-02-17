"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type Me = {
  userId: string;
  username: string;
  elo: number;
};

type AuthContextValue = {
  me: Me | null;
  setMe: (me: Me | null) => void;
  isAuthed: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  me: initialMe,
  children,
}: {
  me: Me | null;
  children: React.ReactNode;
}) {
  const [me, setMe] = useState<Me | null>(initialMe);

  const value = useMemo(
    () => ({
      me,
      setMe,
      isAuthed: !!me,
    }),
    [me]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
