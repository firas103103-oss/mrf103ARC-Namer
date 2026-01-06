import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useState, FormEvent } from "react";
import { 
  Shield, 
  LogIn, 
  Activity, 
  Brain, 
  Lock,
  Fingerprint,
  KeyRound,
  Terminal,
  Zap,
  Globe,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include', // Important: Include cookies
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        // Small delay to ensure session is set
        setTimeout(() => {
          window.location.href = "/virtual-office";
        }, 100);
      } else {
        const data = await response.json().catch(() => ({ error: 'unknown' }));
        console.error('Login failed:', data);
        
        if (data.error === "invalid_credentials") {
          setError(t("landing.errors.invalidKey") || "Invalid security key");
        } else if (data.error === "missing_server_auth_secret") {
          setError("Server configuration error. Please contact administrator.");
        } else {
          setError(t("landing.errors.authFailed") || "Authentication failed");
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t("landing.errors.connectionError") || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Background - Very Light */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="matrix-rain h-full w-full"></div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/5 via-transparent to-transparent blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-blue-500/3 via-transparent to-transparent blur-3xl"></div>

      {/* Lock Animation Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <Lock className="w-[800px] h-[800px] text-cyan-400 animate-pulse" strokeWidth={0.5} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Minimal Header */}
        <header className="absolute top-0 left-0 right-0 z-50 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <div className="relative">
                <Shield className="h-6 w-6 text-cyan-400" strokeWidth={1.5} />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              </div>
            </div>
            <LanguageToggle />
          </div>
        </header>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md space-y-8">
            {!showAuth ? (
              /* Initial State - Locked Portal */
              <div className="text-center space-y-8 animate-fade-in">
                {/* Lock Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
                    <div className="relative p-8 rounded-full border border-cyan-500/20 bg-black/50 backdrop-blur-sm">
                      <Lock className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                      SECURE ACCESS
                    </span>
                  </h1>
                  <p className="text-sm text-zinc-500 font-mono">
                    CLASSIFIED SYSTEM • AUTHORIZED PERSONNEL ONLY
                  </p>
                </div>

                {/* Access Button */}
                <Button
                  onClick={() => setShowAuth(true)}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-cyan-500/20 transition-all duration-300"
                  data-testid="button-unlock"
                >
                  <KeyRound className="w-5 h-5 mr-2" />
                  UNLOCK PORTAL
                </Button>
              </div>
            ) : (
              /* Auth Form - After Unlock */
              <div className="space-y-6 animate-slide-up">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <Fingerprint className="w-12 h-12 text-cyan-400 animate-pulse" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
                  <p className="text-sm text-zinc-500">Enter your credentials to proceed</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin}>
                  <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase tracking-wider">Security Key</label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="bg-black/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-cyan-500/50"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !password}
                      className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 disabled:opacity-50"
                      data-testid="button-login"
                    >
                      {isLoading ? (
                        <>
                          <Activity className="w-4 h-4 mr-2 animate-spin" />
                          AUTHENTICATING...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          AUTHENTICATE
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center text-xs">
                      <button 
                        type="button"
                        onClick={() => setShowAuth(false)}
                        className="text-zinc-500 hover:text-zinc-400 transition-colors"
                      >
                        ← Back to portal
                      </button>
                    </div>
                  </Card>
                </form>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
                  <Shield className="w-3 h-3" />
                  <span>256-bit encryption • Zero-knowledge architecture</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 py-6 px-6">
          <div className="flex flex-col items-center gap-3">
            {/* Logo */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl font-bold tracking-tighter">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  MRF
                </span>
              </div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase">
                Multi-Agent Research Framework
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4 text-[10px]">
              <div className="flex items-center gap-1.5 text-zinc-600">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>SYSTEM ACTIVE</span>
              </div>
              <div className="w-px h-3 bg-zinc-800"></div>
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Globe className="w-3 h-3" />
                <span>SECURE CONNECTION</span>
              </div>
              <div className="w-px h-3 bg-zinc-800"></div>
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Terminal className="w-3 h-3" />
                <span>v2.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.01)_50%)] bg-[length:100%_4px] animate-scanline"></div>

      <style>{`
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        .matrix-rain {
          background-image: 
            linear-gradient(transparent 0%, rgba(0, 255, 255, 0.1) 50%, transparent 100%),
            repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0, 255, 255, 0.03) 2px, transparent 3px);
          animation: matrix-fall 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
