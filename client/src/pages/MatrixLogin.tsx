import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { login } from "@/lib/api";
import { Shield, Lock, Cpu, Terminal, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function MatrixLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [matrixRain, setMatrixRain] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Matrix Rain Effect
  useEffect(() => {
    const chars = "ﺡﻡﺭﻑ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
    const columns = Math.floor(window.innerWidth / 20);
    const drops: number[] = Array(columns).fill(1);

    const interval = setInterval(() => {
      const newRain = drops.map((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        drops[i] = y > 20 && Math.random() > 0.975 ? 0 : y + 1;
        return `${i * 20}px_${y * 20}px_${char}`;
      });
      setMatrixRain(newRain);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(password);
      toast({
        title: "✓ تم التحقق من الهوية",
        description: "مرحباً بك في نظام ARC",
        variant: "default",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "✗ فشل المصادقة",
        description: error.message || "كلمة السر غير صحيحة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 opacity-20">
        {matrixRain.map((drop, i) => {
          const [x, y, char] = drop.split('_');
          return (
            <div
              key={i}
              className="absolute text-matrix-green font-mono text-sm animate-pulse"
              style={{
                left: x,
                top: y,
                textShadow: '0 0 8px #00ff41'
              }}
            >
              {char}
            </div>
          );
        })}
      </div>

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-matrix-green/5 to-transparent animate-scan" />
      </div>

      {/* DNA Helix Animation */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <div className="dna-helix"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8 space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Shield className="h-20 w-20 text-matrix-green animate-pulse-slow" />
                <div className="absolute inset-0 bg-matrix-green/20 blur-xl rounded-full animate-ping" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-matrix-green font-mono tracking-wider">
              ARC SYSTEM
            </h1>
            <p className="text-matrix-green/70 text-sm font-mono">
              [ نظام التحليل الذكي الذاتي التكيفي ]
            </p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-matrix-green/50 font-mono">
              <Cpu className="h-3 w-3 animate-spin-slow" />
              <span>v15.0-ARC2.0</span>
              <span>•</span>
              <span>SECURE GATEWAY</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-black/80 border-2 border-matrix-green/30 rounded-lg p-8 backdrop-blur-sm shadow-2xl shadow-matrix-green/20">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="h-4 w-4 text-matrix-green" />
                <span className="text-matrix-green font-mono text-sm">
                  AUTHENTICATION REQUIRED
                </span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-matrix-green to-transparent mb-6" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Operator ID (Static) */}
              <div className="space-y-2">
                <label className="text-xs text-matrix-green/70 font-mono flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  OPERATOR ID
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value="MR.F-001"
                    disabled
                    className="bg-black/50 border-matrix-green/30 text-matrix-green font-mono h-12 focus:border-matrix-green focus:ring-matrix-green/50 disabled:opacity-70"
                  />
                  <div className="absolute inset-0 border border-matrix-green/20 rounded-md pointer-events-none animate-pulse-border" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs text-matrix-green/70 font-mono flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  ACCESS CODE
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="bg-black/50 border-matrix-green/30 text-matrix-green font-mono h-12 pr-12 focus:border-matrix-green focus:ring-matrix-green/50 placeholder:text-matrix-green/30"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-matrix-green/50 hover:text-matrix-green transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className="absolute inset-0 border border-matrix-green/20 rounded-md pointer-events-none animate-pulse-border" />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !password}
                className="w-full h-12 bg-matrix-green/10 border-2 border-matrix-green text-matrix-green hover:bg-matrix-green/20 font-mono tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Cpu className="h-4 w-4 animate-spin" />
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      INITIATE ACCESS
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-matrix-green/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </form>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-matrix-green/20">
              <div className="flex items-center justify-between text-xs text-matrix-green/50 font-mono">
                <span>ENCRYPTION: AES-256</span>
                <span>PROTOCOL: HTTPS</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-matrix-green/50 font-mono">
              <div className="h-2 w-2 bg-matrix-green rounded-full animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <p className="text-[10px] text-matrix-green/30 font-mono">
              مصادقة متعددة العوامل • مراقبة الجلسة • تسجيل الأحداث
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes pulse-border {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .text-matrix-green {
          color: #00ff41;
        }
        
        .bg-matrix-green\\/10 {
          background-color: rgba(0, 255, 65, 0.1);
        }
        
        .bg-matrix-green\\/20 {
          background-color: rgba(0, 255, 65, 0.2);
        }
        
        .border-matrix-green {
          border-color: #00ff41;
        }
        
        .border-matrix-green\\/20 {
          border-color: rgba(0, 255, 65, 0.2);
        }
        
        .border-matrix-green\\/30 {
          border-color: rgba(0, 255, 65, 0.3);
        }
        
        .shadow-matrix-green\\/20 {
          box-shadow: 0 0 40px rgba(0, 255, 65, 0.2);
        }
        
        /* DNA Helix */
        .dna-helix {
          width: 100%;
          height: 100%;
          position: relative;
          animation: rotate 10s linear infinite;
        }
        
        .dna-helix::before,
        .dna-helix::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, transparent, #00ff41, transparent);
          left: 50%;
          transform: translateX(-50%) rotateY(0deg);
        }
        
        .dna-helix::after {
          transform: translateX(-50%) rotateY(90deg);
        }
        
        @keyframes rotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
