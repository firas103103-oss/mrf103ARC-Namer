import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic2, Loader2 } from "lucide-react";

interface VoiceOption {
  voice_id: string;
  name: string;
  category?: string;
}

export default function ARCVoiceSelector() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    localStorage.getItem("arc_selected_voice") || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/arc/voices");
      const data = await res.json();
      setVoices(data.voices || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setSelectedVoice(value);
    localStorage.setItem("arc_selected_voice", value);
  };

  return (
    <Card data-testid="card-voice-selector">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic2 className="h-5 w-5 text-primary" />
          ARC Voice Selector
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground" data-testid="status-loading">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading voices...
          </div>
        ) : voices.length === 0 ? (
          <p className="text-muted-foreground text-sm" data-testid="status-no-voices">
            No voices available. Make sure the ElevenLabs API is configured.
          </p>
        ) : (
          <Select value={selectedVoice} onValueChange={handleChange}>
            <SelectTrigger data-testid="select-voice-trigger">
              <SelectValue placeholder="Select a voice..." />
            </SelectTrigger>
            <SelectContent>
              {voices.map((v) => (
                <SelectItem 
                  key={v.voice_id} 
                  value={v.voice_id}
                  data-testid={`select-voice-${v.voice_id}`}
                >
                  {v.name} {v.category ? `(${v.category})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
