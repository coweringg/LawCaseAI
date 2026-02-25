import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string; error?: any }>;
  register: (
    userData: any,
  ) => Promise<{ success: boolean; message: string; error?: any }>;
  logout: () => void;
  updateProfile: (userData: {
    name: string;
    lawFirm: string;
    email: string;
  }) => Promise<{ success: boolean; message: string }>;
  changePassword: (
    passwordData: any,
  ) => Promise<{ success: boolean; message: string }>;
  fetchProfile: () => Promise<User | null>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  savedAccounts: any[];
  loginWithSavedAccount: (
    index: number,
  ) => Promise<{ success: boolean; message: string }>;
  removeSavedAccount: (index: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/pricing",
  "/about",
  "/features",
  "/privacy",
  "/terms",
];
const restrictedRoutes = ["/pricing", "/about", "/features", "/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
  const router = useRouter();

  const isAuthenticated = !!user;

  const fetchProfile = async (): Promise<User | null> => {
    try {
      const response = await api.get("/user/profile");
      if (response.data.success) {
        setUser(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      // Silently fail — user is not authenticated
      if (error?.response?.status !== 401) {
        console.warn("Profile fetch failed:", error?.message);
      }
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // In cookie-based auth, we simply try to fetch the profile.
      // If the cookie is present and valid, the backend will return the user.
      await fetchProfile();

      // Load saved accounts
      const stored = localStorage.getItem("lawcase_saved_accounts");
      if (stored) {
        try {
          setSavedAccounts(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse saved accounts");
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Global polling for state sync (membership changes, plan resets)
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    // Polling removed to prevent 429 Too Many Requests errors.
    // Instead of polling every 10s, critical state updates should rely on explicit actions
    // or WebSocket events in the future.

    // Initial fetch to sync state on load
    fetchProfile();
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      const currentPath = router.pathname;
      // Check auth state based on user presence
      const authenticated = !!user;

      if (authenticated && restrictedRoutes.includes(currentPath)) {
        router.push(user.role === "admin" ? "/dashboard/admin" : "/dashboard");
        return;
      }

      if (!authenticated && !publicRoutes.includes(currentPath)) {
        router.push("/login");
        return;
      }
    }
  }, [router, user, isLoading]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string; error?: any }> => {
    try {
      const response = await api.post("/auth/login", { email, password });

      // Check for soft failures first (e.g. 429/503 resolved by interceptor)
      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }

      const { data, message } = response.data;

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Save to recent accounts for 1-click login
      saveAccountToLocal(data.user.name, email, password);

      return { success: true, message: message || "Login successful" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        error: error.response?.data?.error,
      };
    }
  };

  const register = async (
    userData: any,
  ): Promise<{ success: boolean; message: string; error?: any }> => {
    try {
      const response = await api.post("/auth/register", userData);

      // Check for soft failures first (e.g. 429/503 resolved by interceptor)
      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || "Registration failed",
        };
      }

      const { data, message } = response.data;

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Save to recent accounts
      saveAccountToLocal(data.user.name, userData.email, userData.password);

      return { success: true, message: message || "Registration successful" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
        error: error.response?.data?.error,
      };
    }
  };

  const logout = () => {
    api.post("/auth/logout").finally(() => {
      setUser(null);
      localStorage.removeItem("user");
      // NOTE: We do NOT remove `lawcase_saved_accounts` here.
      router.push("/login");
    });
  };

  // --- Saved Accounts Logic ---
  const saveAccountToLocal = (name: string, email: string, pass: string) => {
    try {
      const stored = localStorage.getItem("lawcase_saved_accounts");
      let accounts = stored ? JSON.parse(stored) : [];

      // Remove if already exists to move to top
      accounts = accounts.filter((acc: any) => acc.email !== email);

      // Add new, encoding credentials via base64 for extreme convenience UX
      // (User accepted local device risk)
      accounts.unshift({
        name,
        email,
        initials: name.substring(0, 2).toUpperCase(),
        token: btoa(`${email}:${pass}`),
      });

      // Keep max 3 accounts
      if (accounts.length > 3) accounts = accounts.slice(0, 3);

      localStorage.setItem("lawcase_saved_accounts", JSON.stringify(accounts));
      setSavedAccounts(accounts);
    } catch (e) {
      console.error("Failed to save account", e);
    }
  };

  const loginWithSavedAccount = async (
    index: number,
  ): Promise<{ success: boolean; message: string }> => {
    if (index < 0 || index >= savedAccounts.length)
      return { success: false, message: "Invalid account" };

    const account = savedAccounts[index];
    try {
      const decoded = atob(account.token);
      const [email, password] = decoded.split(":");

      return await login(email, password);
    } catch (e) {
      return {
        success: false,
        message: "Saved account token is invalid or corrupted",
      };
    }
  };

  const removeSavedAccount = (index: number) => {
    if (index < 0 || index >= savedAccounts.length) return;
    
    try {
      const updatedAccounts = [...savedAccounts];
      updatedAccounts.splice(index, 1);
      
      localStorage.setItem("lawcase_saved_accounts", JSON.stringify(updatedAccounts));
      setSavedAccounts(updatedAccounts);
    } catch (e) {
      console.error("Failed to remove saved account", e);
    }
  };

  const updateProfile = async (userData: {
    name: string;
    lawFirm: string;
    email: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put("/user/profile", userData);
      if (response.data.success) {
        setUser(response.data.data);
        return { success: true, message: response.data.message };
      }
      return {
        success: false,
        message: response.data.message || "Failed to update profile",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Network error",
      };
    }
  };

  const changePassword = async (
    passwordData: any,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put("/user/password", passwordData);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to change password",
      };
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser as User);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        fetchProfile,
      updateUser,
      isAuthenticated,
      savedAccounts,
      loginWithSavedAccount,
      removeSavedAccount,
    }}
  >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
