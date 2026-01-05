import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Wifi,
  WifiOff,
  Play,
  Square,
  RotateCcw,
  Download,
  Upload,
  Send,
  Flame,
  Brain,
  FlaskConical,
  Database,
  Search,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { 
  SMELL_CATEGORIES, 
  type SmellProfile,
  type WsDeviceStatus,
  type WsSensorReading,
  type WsCaptureComplete,
  type WsCalibrationComplete,
} from "@shared/schema";

// Connection state enum for proper state management
type ConnectionState = "disconnected" | "connecting" | "connected" | "error" | "reconnecting";

interface SensorReading {
  gasResistance: number;
  temperature: number;
  humidity: number;
  pressure: number;
  iaqScore: number;
  iaqAccuracy: number;
  co2Equivalent: number;
  vocEquivalent: number;
  heaterTemperature: number;
  heaterDuration: number;
  mode: string;
  timestamp: number;
}

interface DeviceStatus {
  connectionState: ConnectionState;
  mode: "idle" | "monitoring" | "calibrating" | "capturing" | "error";
  deviceId: string;
  firmwareVersion: string;
  uptime: number;
  wifiRssi: number;
  freeHeap: number;
  heaterProfile: string;
  lastCalibration: number | null;
  errors: string[];
}

interface CaptureState {
  active: boolean;
  captureId: string | null;
  progress: number;
  samplesCollected: number;
  totalSamples: number;
  startTime: number | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const HEATER_PROFILES = [
  { id: "low_power", name: "Low Power", temp: 200, duration: 100, description: "Battery saving mode" },
  { id: "balanced", name: "Balanced", temp: 280, duration: 120, description: "General use" },
  { id: "high_sensitivity", name: "High Sensitivity", temp: 320, duration: 150, description: "Best VOC detection" },
  { id: "rapid", name: "Rapid", temp: 350, duration: 80, description: "Fast response" },
];

const IAQ_LEVELS = [
  { min: 0, max: 50, label: "Excellent", color: "text-green-500", bg: "bg-green-500/20" },
  { min: 51, max: 100, label: "Good", color: "text-emerald-500", bg: "bg-emerald-500/20" },
  { min: 101, max: 150, label: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500/20" },
  { min: 151, max: 200, label: "Poor", color: "text-orange-500", bg: "bg-orange-500/20" },
  { min: 201, max: 300, label: "Unhealthy", color: "text-red-500", bg: "bg-red-500/20" },
  { min: 301, max: 500, label: "Hazardous", color: "text-purple-500", bg: "bg-purple-500/20" },
];

function getIaqLevel(score: number) {
  return IAQ_LEVELS.find((l) => score >= l.min && score <= l.max) || IAQ_LEVELS[0];
}

export default function BioSentinel() {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [currentReading, setCurrentReading] = useState<SensorReading | null>(null);
  const [readingsHistory, setReadingsHistory] = useState<SensorReading[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    connectionState: "disconnected",
    mode: "idle",
    deviceId: "xbs-esp32-001",
    firmwareVersion: "1.0.0",
    uptime: 0,
    wifiRssi: -50,
    freeHeap: 0,
    heaterProfile: "standard",
    lastCalibration: null,
    errors: [],
  });
  const [captureState, setCaptureState] = useState<CaptureState>({
    active: false,
    captureId: null,
    progress: 0,
    samplesCollected: 0,
    totalSamples: 30,
    startTime: null,
  });
  const [selectedHeaterProfile, setSelectedHeaterProfile] = useState("high_sensitivity");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileCategory, setNewProfileCategory] = useState("");
  const [newProfileTags, setNewProfileTags] = useState("");
  const [selectedProfileForMatch, setSelectedProfileForMatch] = useState<SmellProfile | null>(null);

  const profilesQuery = useQuery<SmellProfile[]>({
    queryKey: ["/api/bio-sentinel/profiles"],
  });

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/bio-sentinel`;

    // Set connecting state
    const isReconnect = reconnectAttempts > 0;
    setConnectionState(isReconnect ? "reconnecting" : "connecting");
    setDeviceStatus((prev) => ({ ...prev, connectionState: isReconnect ? "reconnecting" : "connecting" }));

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnectionState("connected");
        setReconnectAttempts(0);
        setDeviceStatus((prev) => ({ ...prev, connectionState: "connected" }));
        toast({ 
          title: isReconnect ? "Reconnected" : "Connected", 
          description: "Bio Sentinel device connected" 
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (e) {
          // Invalid WebSocket message format - ignore
        }
      };

      ws.onclose = (event) => {
        setConnectionState("disconnected");
        setDeviceStatus((prev) => ({ ...prev, connectionState: "disconnected" }));
        
        // Clear any existing reconnect timer
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Exponential backoff for reconnection (max 30 seconds)
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        setReconnectAttempts((prev) => prev + 1);
        
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      };

      ws.onerror = (error) => {
        setConnectionState("error");
        setDeviceStatus((prev) => ({ ...prev, connectionState: "error" }));
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      setConnectionState("error");
      setDeviceStatus((prev) => ({ ...prev, connectionState: "error" }));
      
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      setReconnectAttempts((prev) => prev + 1);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
    }
  }, [toast, reconnectAttempts]);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case "sensor_reading":
        const reading: SensorReading = {
          gasResistance: data.payload.gas_resistance,
          temperature: data.payload.temperature,
          humidity: data.payload.humidity,
          pressure: data.payload.pressure || 0,
          iaqScore: data.payload.iaq_score || 0,
          iaqAccuracy: data.payload.iaq_accuracy || 0,
          co2Equivalent: data.payload.co2_equivalent || 0,
          vocEquivalent: data.payload.voc_equivalent || 0,
          heaterTemperature: data.payload.heater_temp || 0,
          heaterDuration: data.payload.heater_duration || 0,
          mode: data.payload.mode || "idle",
          timestamp: data.timestamp,
        };
        setCurrentReading(reading);
        setReadingsHistory((prev) => [...prev.slice(-59), reading]);
        break;

      case "device_status":
        setDeviceStatus((prev) => ({
          ...prev,
          mode: data.payload.mode,
          uptime: data.payload.uptime_ms,
          wifiRssi: data.payload.wifi_rssi,
          freeHeap: data.payload.free_heap || 0,
          heaterProfile: data.payload.heater_profile || "standard",
          firmwareVersion: data.payload.firmware_version || "1.0.0",
          lastCalibration: data.payload.last_calibration,
          errors: data.payload.errors || [],
        }));
        break;

      case "heater_status":
        break;

      case "calibration_complete":
        if (data.payload.success) {
          toast({
            title: "Calibration Complete",
            description: `Baseline: ${data.payload.baseline_gas} ohms`,
          });
          setDeviceStatus((prev) => ({
            ...prev,
            mode: "monitoring",
            lastCalibration: Date.now(),
          }));
        } else {
          toast({
            title: "Calibration Failed",
            description: data.payload.error || "Unknown error",
            variant: "destructive",
          });
          setDeviceStatus((prev) => ({ ...prev, mode: "error" }));
        }
        break;

      case "capture_complete":
        setCaptureState({
          active: false,
          captureId: data.payload.capture_id,
          progress: 100,
          samplesCollected: data.payload.samples_count,
          totalSamples: data.payload.samples_count,
          startTime: null,
        });
        if (data.payload.success) {
          toast({
            title: "Capture Complete",
            description: `Collected ${data.payload.samples_count} samples`,
          });
        } else {
          toast({
            title: "Capture Failed",
            description: data.payload.error || "Unknown error",
            variant: "destructive",
          });
        }
        break;

      case "command_ack":
        if (data.payload.status === "failed") {
          toast({
            title: "Command Failed",
            description: data.payload.error || `Failed to execute: ${data.payload.command}`,
            variant: "destructive",
          });
        }
        break;

      case "error":
        toast({
          title: "Device Error",
          description: data.payload.message,
          variant: "destructive",
        });
        break;
    }
  }, [toast]);

  const sendCommand = useCallback((type: string, payload: object = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      toast({
        title: "Not Connected",
        description: "Device is not connected",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSetMode = (mode: string) => {
    sendCommand("set_mode", { mode });
    setDeviceStatus((prev) => ({ ...prev, mode: mode as DeviceStatus["mode"] }));
  };

  const handleStartCalibration = () => {
    sendCommand("start_calibration", { duration_seconds: 60 });
    setDeviceStatus((prev) => ({ ...prev, mode: "calibrating" }));
  };

  const handleStartCapture = () => {
    const captureId = `cap-${Date.now()}`;
    sendCommand("start_capture", {
      capture_id: captureId,
      duration_seconds: 30,
      label: newProfileName || "Unnamed capture",
      profile_id: selectedProfileForMatch?.id || null,
      heater_profile: selectedHeaterProfile,
    });
    setCaptureState({
      active: true,
      captureId,
      progress: 0,
      samplesCollected: 0,
      totalSamples: 30,
      startTime: Date.now(),
    });
    setDeviceStatus((prev) => ({ ...prev, mode: "capturing" }));
  };

  const handleStopCapture = () => {
    sendCommand("stop", {});
    setCaptureState((prev) => ({ ...prev, active: false }));
    setDeviceStatus((prev) => ({ ...prev, mode: "monitoring" }));
  };

  const handleSaveProfile = async () => {
    if (!newProfileName.trim()) {
      toast({ title: "Error", description: "Please enter a profile name", variant: "destructive" });
      return;
    }

    try {
      await apiRequest("POST", "/api/bio-sentinel/profiles", {
        name: newProfileName,
        category: newProfileCategory || "unknown",
        captureId: captureState.captureId,
        tags: newProfileTags.split(",").map((t) => t.trim()).filter(Boolean),
        featureVector: [],
        baselineGas: currentReading?.gasResistance,
        peakGas: Math.min(...readingsHistory.map((r) => r.gasResistance)),
      });
      toast({ title: "Profile Saved", description: `Saved as "${newProfileName}"` });
      queryClient.invalidateQueries({ queryKey: ["/api/bio-sentinel/profiles"] });
      setNewProfileName("");
      setNewProfileCategory("");
      setNewProfileTags("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await apiRequest("POST", "/api/bio-sentinel/chat", {
        message: chatInput,
        context: {
          recentReadings: readingsHistory.slice(-10).map((r) => ({
            deviceId: deviceStatus.deviceId,
            gasResistance: r.gasResistance,
            temperature: r.temperature,
            humidity: r.humidity,
            pressure: r.pressure,
            iaqScore: r.iaqScore,
            co2Equivalent: r.co2Equivalent,
            vocEquivalent: r.vocEquivalent,
          })),
          currentProfile: selectedProfileForMatch?.name,
        },
      });

      const data = await response.json();
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: data.response || "I couldn't analyze the data at this time.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e.message}`, timestamp: new Date() },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWebSocket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (captureState.active && captureState.startTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - captureState.startTime!;
        const progress = Math.min((elapsed / 30000) * 100, 100);
        const samples = Math.min(Math.floor(elapsed / 1000), 30);
        setCaptureState((prev) => ({
          ...prev,
          progress,
          samplesCollected: samples,
        }));
        if (progress >= 100) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [captureState.active, captureState.startTime]);

  const iaqLevel = currentReading ? getIaqLevel(currentReading.iaqScore) : IAQ_LEVELS[0];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto" data-testid="page-bio-sentinel">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Zap className="h-6 w-6 text-primary" />
            X Bio Sentinel
          </h1>
          <p className="text-muted-foreground mt-1">AI-Powered Electronic Nose System</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={connectionState === "connected" ? "bg-secondary/10 text-secondary border-secondary/30" : connectionState === "connecting" || connectionState === "reconnecting" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : "bg-destructive/10 text-destructive border-destructive/30"}
            data-testid="badge-connection-status"
          >
            {connectionState === "connected" ? <Wifi className="w-3 h-3 mr-1" /> : connectionState === "connecting" || connectionState === "reconnecting" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {connectionState === "connected" ? "Connected" : connectionState === "connecting" ? "Connecting" : connectionState === "reconnecting" ? `Reconnecting (${reconnectAttempts})` : connectionState === "error" ? "Error" : "Disconnected"}
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30" data-testid="badge-device-mode">
            {deviceStatus.mode.charAt(0).toUpperCase() + deviceStatus.mode.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card data-testid="card-gas-resistance">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Wind className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Gas</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-mono font-semibold" data-testid="text-gas-value">
                    {currentReading ? (currentReading.gasResistance / 1000).toFixed(1) : "--"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">kOhm</span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-temperature">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Thermometer className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Temp</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-mono font-semibold" data-testid="text-temp-value">
                    {currentReading ? currentReading.temperature.toFixed(1) : "--"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">C</span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-humidity">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Droplets className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Humidity</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-mono font-semibold" data-testid="text-humidity-value">
                    {currentReading ? currentReading.humidity.toFixed(1) : "--"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">%</span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-iaq">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="outline" className={`${iaqLevel.bg} ${iaqLevel.color} border-0 text-[10px]`}>
                    {iaqLevel.label}
                  </Badge>
                </div>
                <div className="mt-2">
                  <span className={`text-2xl font-mono font-semibold ${iaqLevel.color}`} data-testid="text-iaq-value">
                    {currentReading ? currentReading.iaqScore : "--"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">IAQ</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card data-testid="card-voc">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <FlaskConical className="h-4 w-4" />
                  <span className="text-xs">VOC Equivalent</span>
                </div>
                <span className="text-xl font-mono font-semibold" data-testid="text-voc-value">
                  {currentReading ? currentReading.vocEquivalent.toFixed(2) : "--"} ppm
                </span>
              </CardContent>
            </Card>

            <Card data-testid="card-co2">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Wind className="h-4 w-4" />
                  <span className="text-xs">CO2 Equivalent</span>
                </div>
                <span className="text-xl font-mono font-semibold" data-testid="text-co2-value">
                  {currentReading ? currentReading.co2Equivalent : "--"} ppm
                </span>
              </CardContent>
            </Card>

            <Card data-testid="card-heater">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs">Heater</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-semibold" data-testid="text-heater-value">
                    {currentReading ? currentReading.heaterTemperature : "--"}C
                  </span>
                  {currentReading && currentReading.heaterDuration > 0 && (
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30 text-[10px]">
                      {currentReading.heaterDuration}ms
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-control-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Control Panel</CardTitle>
              <CardDescription>Manage sensor operation modes and capture smells</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={deviceStatus.mode === "idle" ? "default" : "outline"}
                  onClick={() => handleSetMode("idle")}
                  disabled={captureState.active}
                  data-testid="button-mode-idle"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Idle
                </Button>
                <Button
                  variant={deviceStatus.mode === "monitoring" ? "default" : "outline"}
                  onClick={() => handleSetMode("monitoring")}
                  disabled={captureState.active}
                  data-testid="button-mode-monitoring"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Monitor
                </Button>
                <Button
                  variant={deviceStatus.mode === "capturing" ? "default" : "outline"}
                  onClick={() => handleSetMode("capturing")}
                  disabled={captureState.active}
                  data-testid="button-mode-capturing"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Capture Mode
                </Button>
                <Button variant="outline" onClick={handleStartCalibration} disabled={captureState.active} data-testid="button-calibrate">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Calibrate
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Heater Profile</label>
                  <Select value={selectedHeaterProfile} onValueChange={setSelectedHeaterProfile}>
                    <SelectTrigger data-testid="select-heater-profile">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEATER_PROFILES.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name} ({profile.temp}C)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-md p-4 space-y-3" data-testid="section-capture">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Smell Capture</span>
                  {captureState.active ? (
                    <Button variant="destructive" size="sm" onClick={handleStopCapture} data-testid="button-stop-capture">
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleStartCapture} data-testid="button-start-capture">
                      <Play className="h-4 w-4 mr-2" />
                      Start Capture
                    </Button>
                  )}
                </div>
                {captureState.active && (
                  <div className="space-y-2">
                    <Progress value={captureState.progress} data-testid="progress-capture" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Samples: {captureState.samplesCollected}/{captureState.totalSamples}</span>
                      <span>{captureState.progress.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
                {captureState.captureId && !captureState.active && captureState.progress >= 100 && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center gap-2 text-secondary">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Capture complete - Save profile</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Profile name"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        data-testid="input-profile-name"
                      />
                      <Select value={newProfileCategory} onValueChange={setNewProfileCategory}>
                        <SelectTrigger data-testid="select-profile-category">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(SMELL_CATEGORIES).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Tags (comma separated)"
                        value={newProfileTags}
                        onChange={(e) => setNewProfileTags(e.target.value)}
                        data-testid="input-profile-tags"
                      />
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full" data-testid="button-save-profile">
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-smell-library">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Smell Library
                  </CardTitle>
                  <CardDescription>Stored smell fingerprints</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-export-profiles">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-import-profiles">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profilesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : profilesQuery.data && profilesQuery.data.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {profilesQuery.data.map((profile) => (
                      <div
                        key={profile.id}
                        className={`p-3 rounded-md border hover-elevate cursor-pointer ${
                          selectedProfileForMatch?.id === profile.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedProfileForMatch(profile)}
                        data-testid={`profile-card-${profile.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{profile.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">
                                {profile.category || "Unknown"}
                              </Badge>
                              {profile.confidence && (
                                <span className="text-xs text-muted-foreground">
                                  {profile.confidence}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" data-testid={`button-delete-profile-${profile.id}`}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No smell profiles stored yet</p>
                  <p className="text-sm">Start a capture to create your first profile</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-[600px] flex flex-col" data-testid="card-ai-chat">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis
              </CardTitle>
              <CardDescription>Ask questions about sensor data and smells</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ask me about your sensor readings</p>
                      <div className="mt-4 space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start"
                          onClick={() => setChatInput("What smell is this?")}
                          data-testid="button-suggestion-1"
                        >
                          What smell is this?
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start"
                          onClick={() => setChatInput("Why did VOC levels spike?")}
                          data-testid="button-suggestion-2"
                        >
                          Why did VOC levels spike?
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start"
                          onClick={() => setChatInput("Is this air quality safe?")}
                          data-testid="button-suggestion-3"
                        >
                          Is this air quality safe?
                        </Button>
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                        data-testid={`chat-message-${i}`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[10px] opacity-70">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="flex gap-2 pt-4 border-t mt-4">
                <Input
                  placeholder="Ask about sensor data..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                  disabled={isChatLoading}
                  data-testid="input-chat"
                />
                <Button onClick={handleChatSubmit} disabled={isChatLoading || !chatInput.trim()} data-testid="button-send-chat">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-device-info">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Device Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device ID</span>
                <span className="font-mono" data-testid="text-device-id">{deviceStatus.deviceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firmware</span>
                <span className="font-mono" data-testid="text-firmware">{deviceStatus.firmwareVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">WiFi Signal</span>
                <span data-testid="text-wifi-rssi">{deviceStatus.wifiRssi} dBm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span data-testid="text-uptime">{Math.floor(deviceStatus.uptime / 60000)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Calibration</span>
                <span data-testid="text-last-calibration">
                  {deviceStatus.lastCalibration
                    ? new Date(deviceStatus.lastCalibration).toLocaleString()
                    : "Never"}
                </span>
              </div>
              {deviceStatus.errors.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Errors</span>
                  </div>
                  {deviceStatus.errors.map((err, i) => (
                    <div key={i} className="text-xs text-destructive/80 ml-6">
                      {err}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
