import * as React from "react";
import { login, me } from "@/lib/api";

export default function OperatorLogin() {
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  const checkMe = React.useCallback(async () => {
    try {
      const user = await me();
      setUserEmail(user.email);
      setStatus("ok");
      setError(null);
    } catch {
      setUserEmail(null);
    }
  }, []);

  React.useEffect(() => {
    void checkMe();
  }, [checkMe]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      await login(password);
      await checkMe();
      setStatus("ok");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md border border-border rounded-md p-6 bg-card">
        <h1 className="text-lg font-semibold text-foreground">Operator Login</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter operator password to access ARC dashboard.</p>

        {userEmail && (
          <div className="mt-4 text-sm text-green-500" data-testid="status-logged-in">
            Logged in as {userEmail}
          </div>
        )}

        {!userEmail && (
          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <label className="block text-sm text-foreground">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="••••••••"
                autoComplete="current-password"
                data-testid="input-password"
              />
            </label>

            <button
              type="submit"
              disabled={status === "loading" || password.length === 0}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              data-testid="button-login"
            >
              {status === "loading" ? "Logging in..." : "Login"}
            </button>

            {status === "error" && error && (
              <div className="text-sm text-destructive" data-testid="text-login-error">
                {error}
              </div>
            )}
          </form>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          Tip: the session cookie is stored automatically by the browser.
        </div>
      </div>
    </div>
  );
}
