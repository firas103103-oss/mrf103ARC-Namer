import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Terminal, Cpu, ShieldCheck } from "lucide-react";

export function OperatorLogin() {
  const { loginMutation } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      
      <Card className="w-full max-w-md relative z-10 glass border-primary/30 shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-pulse-glow">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-widest font-mono text-white text-glow">
              ARC <span className="text-primary">2.0</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase">
              Secure Access Required
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Cpu className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="OPERATOR ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-black/40 border-primary/20 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary h-12 font-mono tracking-wider transition-all"
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="password"
                  placeholder="ACCESS CODE"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/40 border-primary/20 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary h-12 font-mono tracking-wider transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 hover:border-primary transition-all duration-300 uppercase tracking-widest font-bold text-glow shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Initialize Session
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 flex justify-between text-[10px] font-mono text-gray-600 uppercase">
            <span>System: <span className="text-success">Online</span></span>
            <span>Encryption: <span className="text-primary">AES-256</span></span>
            <span>Version: 2.1.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    