import * as React from "react";
import { api } from "@/lib/api";

export default function CommandConsole({
  onSent,
}: {
  onSent?: () => Promise<void> | void;
}) {
  const [text, setText] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "error">("idle");
  const [reply, setReply] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const send = async () => {
    if (!text.trim()) return;
    setStatus("sending");
    setError("");
    setReply("");

    try {
      const res = await api<{ reply: string }>("/api/call_mrf_brain", {
        method: "POST",
        json: { text: text.trim(), mode: "operator" },
      });
      setReply(res.reply || "(no response)");
      setStatus("idle");
      setText("");
      await onSent?.();
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Failed to send");
    }
  };

  return (
    <div className="border border-border rounded-md p-3 bg-card" data-testid="command-console">
      <div className="text-sm font-medium text-foreground">Command Console</div>
      <div className="mt-2 space-y-2">
        <textarea
          className="w-full min-h-[96px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          placeholder="Type a command for Mr.F..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          data-testid="textarea-command"
        />
        <button
          type="button"
          onClick={send}
          disabled={status === "sending" || text.trim().length === 0}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          data-testid="button-send-command"
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>

        {status === "error" && error && (
          <div className="text-sm text-destructive" data-testid="text-command-error">{error}</div>
        )}

        {reply && (
          <div className="rounded-md border border-border bg-background p-2 text-sm text-foreground" data-testid="text-command-reply">
            {reply}
          </div>
        )}
      </div>
    </div>
  );
}
