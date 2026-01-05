import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useAuth() {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: mounted,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  return {
    user: user ?? null,
    isAuthenticated: !!user && mounted,
    isLoading: isLoading || !mounted,
    error,
    loginMutation,
  };
}