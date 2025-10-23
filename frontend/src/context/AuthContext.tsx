import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { fetchCurrentProfile, listenToAuthState, logout } from "../services/auth";
import type { AppProfile } from "../types/auth";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: AppProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    const nextProfile = await fetchCurrentProfile();
    setProfile(nextProfile);
  };

  useEffect(() => {
    const unsubscribe = listenToAuthState(async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        const nextProfile = await fetchCurrentProfile();
        setProfile(nextProfile);
      } catch {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      isLoading,
      refreshProfile,
      logoutUser: logout
    }),
    [firebaseUser, profile, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
