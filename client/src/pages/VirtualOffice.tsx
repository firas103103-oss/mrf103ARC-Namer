import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Volume2, Loader2 } from "lucide-react";
import VoiceChatRealtime from "../components/VoiceChatRealtime";

const agents = [
  { name: "Mr.F", role: "Executive Brain" },
  { name: "L0-Comms", role: "Communications Director" },
  { name: "L0-Ops", role: "Operations Commander" },
  { name: "L0-Intel", role: "Intelligence Analyst" },
  { name: "Dr. Maya Quest", role: "Research Analyst" },
  { name: "Jordan Spark", role: "Creative Director" }
];

export default function VirtualOffice() {
  const [loading, setLoading] = useState<string | null>(null);

  const playVoice = async (agent: string) => {
    try {
      setLoading(agent);
      const res = await fetch("/api/call_mrf_brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: agent,
          free_text: `Hello, I am ${agent}. Happy to speak with you in the ARC Virtual Office.`
        })
      });
      const data = await res.json();
      if (data.voice) {
        const audio = new Audio(data.voice);
        audio.play();
      }
    } catch (e) {
      // Voice playback failed - silently ignore
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
          <Users className="h-6 w-6 text-primary" />
          Agent Voices
        </h1>
        <p className="text-muted-foreground mt-1">Interact with ARC multi-agent voice system</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((a) => (
          <Card key={a.name} data-testid={`card-agent-${a.name}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="text-lg">{a.name}</span>
                <Badge variant="outline">{a.role}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => playVoice(a.name)}
                disabled={loading === a.name}
                className="w-full"
                data-testid={`button-play-${a.name}`}
              >
                {loading === a.name ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Play Voice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <VoiceChatRealtime />
      </div>
    </div>
  );
}
