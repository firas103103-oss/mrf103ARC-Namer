import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SiMatrix } from "react-icons/si";
import { useLocation } from "wouter"; // ضروري للتوجيه

export function OperatorLogin() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ password });
      
      toast({
        title: "Access Granted",
        description: "Welcome back, Operator.",
        variant: "default",
      });

      // Force page reload to ensure session is loaded
      // This avoids race conditions with query cache
      window.location.href = "/virtual-office";

    } catch (error) {
      toast({
        title: "Access Denied",
        description: "Invalid operator credentials.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/95 text-green-500 font-mono p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518544806352-a228605200bd?q=80&w=2069&auto=format&fit=crop')] opacity-10 bg-cover bg-center pointer-events-none" />
      
      <Card className="w-full max-w-md border-green-500/30 bg-black/80 backdrop-blur-md shadow-[0_0_30px_rgba(34,197,94,0.2)]">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-green-900/20 p-4 rounded-full w-20 h-20 flex items-center justify-center border border-green-500/50 animate-pulse">
            <SiMatrix className="w-10 h-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-400 tracking-wider">SYSTEM ACCESS</CardTitle>
          <CardDescription className="text-green-600/80">
            Enter ARC Operator Credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter Passkey..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-green-500/30 text-green-400 placeholder:text-green-800 text-center tracking-widest text-lg focus:border-green-400 focus:ring-green-400/20"
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    