import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useAuth() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: mounted,
  });

  return {
    user: user ?? null,
    isAuthenticated: !!user && mounted,
    isLoading: isLoading || !mounted,
    error,
  };
}