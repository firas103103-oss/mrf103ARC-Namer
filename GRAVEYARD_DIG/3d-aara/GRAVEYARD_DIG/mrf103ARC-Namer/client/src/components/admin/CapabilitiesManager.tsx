/**
 * Capabilities Manager Component
 * Configure and toggle core agent capabilities
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  MessageSquare,
  Phone,
  Globe,
  Target,
  Link,
  BarChart3,
} from "lucide-react";
import { type CoreAgentCapability } from "./types";

interface CapabilitiesManagerProps {
  capabilities: CoreAgentCapability[];
  onToggle: (id: string, enabled: boolean) => void;
  className?: string;
}

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-5 w-5" />,
  whatsapp: <MessageSquare className="h-5 w-5" />,
  calls: <Phone className="h-5 w-5" />,
  "social-media": <Globe className="h-5 w-5" />,
  "ad-campaigns": <Target className="h-5 w-5" />,
  "web-scraping": <Link className="h-5 w-5" />,
  "market-analysis": <BarChart3 className="h-5 w-5" />,
};

const TYPE_COLORS: Record<string, string> = {
  communication: "bg-blue-500/10 text-blue-500",
  automation: "bg-green-500/10 text-green-500",
  analysis: "bg-purple-500/10 text-purple-500",
  integration: "bg-orange-500/10 text-orange-500",
};

export function CapabilitiesManager({ capabilities, onToggle, className }: CapabilitiesManagerProps) {
  const groupedCapabilities = capabilities.reduce((acc, cap) => {
    if (!acc[cap.type]) acc[cap.type] = [];
    acc[cap.type].push(cap);
    return acc;
  }, {} as Record<string, CoreAgentCapability[]>);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Core Capabilities</CardTitle>
        <CardDescription>
          Enable or disable core agent capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedCapabilities).map(([type, caps]) => (
          <div key={type} className="space-y-3">
            <h4 className="text-sm font-medium capitalize flex items-center gap-2">
              <Badge variant="outline" className={TYPE_COLORS[type]}>
                {type}
              </Badge>
            </h4>
            <div className="space-y-2">
              {caps.map((capability) => (
                <div
                  key={capability.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${capability.name} - ${capability.enabled ? "Enabled" : "Disabled"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${TYPE_COLORS[capability.type]}`}>
                      {CAPABILITY_ICONS[capability.id] || <Globe className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{capability.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatConfig(capability.config)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={capability.enabled}
                    onCheckedChange={(checked) => onToggle(capability.id, checked)}
                    aria-label={`Toggle ${capability.name}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function formatConfig(config: Record<string, unknown>): string {
  const entries = Object.entries(config);
  if (entries.length === 0) return "No configuration";
  
  return entries
    .slice(0, 2)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
      return `${key}: ${value}`;
    })
    .join(" • ");
}
