/**
 * Device Status Component
 * Shows connection status and device information
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  WifiOff,
  Activity,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { type DeviceStatus, type ConnectionState } from "./types";

interface DeviceStatusCardProps {
  status: DeviceStatus;
  onReconnect?: () => void;
  className?: string;
}

export function DeviceStatusCard({ status, onReconnect, className }: DeviceStatusCardProps) {
  const getConnectionIcon = (state: ConnectionState) => {
    switch (state) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "connecting":
      case "reconnecting":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConnectionBadge = (state: ConnectionState) => {
    const variants: Record<ConnectionState, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      connected: { variant: "default", label: "Connected" },
      connecting: { variant: "secondary", label: "Connecting..." },
      reconnecting: { variant: "secondary", label: "Reconnecting..." },
      disconnected: { variant: "outline", label: "Disconnected" },
      error: { variant: "destructive", label: "Error" },
    };
    return variants[state];
  };

  const connectionBadge = getConnectionBadge(status.connectionState);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Device Status
          </div>
          <Badge variant={connectionBadge.variant}>
            {getConnectionIcon(status.connectionState)}
            <span className="ml-1">{connectionBadge.label}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Device ID</p>
            <p className="font-mono">{status.deviceId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Firmware</p>
            <p className="font-mono">v{status.firmwareVersion}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Uptime</p>
            <p>{formatUptime(status.uptime)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">WiFi Signal</p>
            <p>{status.wifiRssi} dBm</p>
          </div>
          <div>
            <p className="text-muted-foreground">Free Memory</p>
            <p>{(status.freeHeap / 1024).toFixed(1)} KB</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mode</p>
            <Badge variant="outline" className="capitalize">
              {status.mode}
            </Badge>
          </div>
        </div>

        {/* Errors */}
        {status.errors.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm text-destructive font-medium mb-2">Errors:</p>
            <ul className="text-sm space-y-1">
              {status.errors.map((error, i) => (
                <li key={i} className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reconnect Button */}
        {(status.connectionState === "disconnected" || status.connectionState === "error") && onReconnect && (
          <Button
            onClick={onReconnect}
            variant="outline"
            className="w-full"
            tabIndex={0}
            aria-label="Reconnect to device"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reconnect
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
