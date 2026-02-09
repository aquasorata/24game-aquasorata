"use client";

import { createContext, useContext } from "react";

export type UserContextValue = {
  userId: string | null;
};

export const UserContext = createContext<UserContextValue | undefined>(
  undefined
);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("User must be used inside <UserContext.Provider>");
  }
  return ctx;
}
