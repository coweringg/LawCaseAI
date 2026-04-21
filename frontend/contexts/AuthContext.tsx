import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { User } from "@/types";

export interface SavedAccount {
  name: string;
  email: string;
  initials: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: unknown;
    };
  };
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string; error?: unknown }>;
  register: (
    userData: Record<string, unknown>,
  ) => Promise<{ success: boolean; message: string; error?: unknown }>;
  logout: () => void;
  updateProfile: (userData: {
    name: string;
    lawFirm: string;
    email: string;
  }) => Promise<{ success: boolean; message: string }>;
  changePassword: (
    passwordData: Record<string, unknown>,
  ) => Promise<{ success: boolean; message: string }>;
  fetchProfile: () => Promise<User | null>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  savedAccounts: SavedAccount[];
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
  "/refund",
];
const restrictedRoutes = ["/pricing", "/about", "/features", "/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  const fetchProfile = async (): Promise<User | null> => {
    try {
      const response = await api.get("/user/profile");
      if (response.data.success) {
        setUser(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error?.response?.status !== 401) {
        console.warn("Profile fetch failed:", error?.message);
      }
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await fetchProfile();

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

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    fetchProfile();
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && pathname) {
      const authenticated = !!user;

      if (authenticated && restrictedRoutes.includes(pathname)) {
        router.push(user.role === "admin" ? "/dashboard/admin" : "/dashboard");
        return;
      }

      if (!authenticated && !publicRoutes.includes(pathname)) {
        router.push("/login");
        return;
      }
    }
  }, [pathname, user, isLoading, router]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string; error?: unknown }> => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }

      const { data, message } = response.data;

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      saveAccountToLocal(data.user.name, email);

      return { success: true, message: message || "Login successful" };
    } catch (err: unknown) {
      const error = err as ApiError;
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        error: error.response?.data?.error,
      };
    }
  };

  const register = async (
    userData: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string; error?: unknown }> => {
    try {
      const response = await api.post("/auth/register", userData);

      if (!response.data.success) {
        return {
          success: false,
          message: response.data.message || "Registration failed",
        };
      }

      const { data, message } = response.data;

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      saveAccountToLocal(data.user.name, userData.email as string);

      return { success: true, message: message || "Registration successful" };
    } catch (err: unknown) {
      const error = err as ApiError;
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
      router.push("/login");
    });
  };

  const saveAccountToLocal = (name: string, email: string) => {
    try {
      const stored = localStorage.getItem("lawcase_saved_accounts");
      let accounts: SavedAccount[] = stored ? JSON.parse(stored) : [];

      accounts = accounts.filter((acc: SavedAccount) => acc.email !== email);

      accounts.unshift({
        name,
        email,
        initials: name.substring(0, 2).toUpperCase(),
      });

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
      const response = await api.post("/auth/saved-login", { 
        email: account.email
      });

      if (!response.data.success) {
        removeSavedAccount(index);
        return {
          success: false,
          message: response.data.message || "Session expired. Please log in again.",
        };
      }

      const { data, message } = response.data;

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      saveAccountToLocal(data.user.name, account.email);

      return { success: true, message: message || "Login successful" };
    } catch (err: unknown) {
      const error = err as ApiError;
      removeSavedAccount(index);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
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
    } catch (err: unknown) {
      const error = err as ApiError;
      return {
        success: false,
        message: error.response?.data?.message || "Network error",
      };
    }
  };

  const changePassword = async (
    passwordData: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put("/user/password", passwordData);
      return { success: true, message: response.data.message };
    } catch (err: unknown) {
      const error = err as ApiError;
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
