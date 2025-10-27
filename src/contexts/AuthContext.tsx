"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, AuthContextType, Permission, ROLE_PERMISSIONS } from "@/lib/types";
import { mockSystemUsers } from "@/lib/mockData";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize with Admin by default to avoid hydration mismatch
  const [user, setUser] = useState<AuthUser | null>(mockSystemUsers[0]);
  const [isMounted, setIsMounted] = useState(false);

  // Load user from localStorage on mount (para desenvolvimento)
  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("backadmin_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.error("Error loading user from localStorage:", e);
        // Keep default admin user
      }
    } else {
      // Save default Admin to localStorage
      localStorage.setItem("backadmin_user", JSON.stringify(mockSystemUsers[0]));
    }
  }, []);

  // Save user to localStorage when it changes (only after mounted)
  useEffect(() => {
    if (isMounted && user) {
      localStorage.setItem("backadmin_user", JSON.stringify(user));
    }
  }, [user, isMounted]);

  // Helper: Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions.includes(permission);
  };

  // Helper: Check if user has ANY of the permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some((p) => hasPermission(p));
  };

  // Helper: Check if user has ALL permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every((p) => hasPermission(p));
  };

  const value: AuthContextType = {
    user,
    setUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
