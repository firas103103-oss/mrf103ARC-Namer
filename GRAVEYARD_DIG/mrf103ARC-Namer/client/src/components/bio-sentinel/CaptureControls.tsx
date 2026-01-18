/**
 * Capture Controls Component
 * Controls for smell profile capture sessions
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Play,
  Square,
  RotateCcw,
  Flame,
  Loader2,
} from "lucide-react";
import { type CaptureState, type HeaterProfile, HEATER_PROFILES } from "./types";

interface CaptureControlsProps {
  captureState: CaptureState;
  selectedProfile: string;
  onProfileChange: (profile: string) => void;
  onStartCapture: () => void;
  onStopCapture: () => void;
  onCalibrate: () => void;
  isConnected: boolean;
  className?: string;
}

export function CaptureControls({
  captureState,
  selectedProfile,
  onProfileChange,
  onStartCapture,
  onStopCapture,
  onCalibrate,
  isConnected,
  className,
}: CaptureControlsProps) {
  const currentProfile = HEATER_PROFILES.find(p => p.id === selectedProfile);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Capture Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Heater Profile Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Heater Profile</label>
          <Select
            value={selectedProfile}
            onValueChange={onProfileChange}
            disabled={captureState.active}
          >
            <SelectTrigger tabIndex={0} aria-label="Select heater profile">
              <SelectValue placeholder="Select profile" />
            </SelectTrigger>
            <SelectContent>
              {HEATER_PROFILES.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex flex-col">
                    <span>{profile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {profile.temp}°C / {profile.duration}ms
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentProfile && (
            <p className="text-xs text-muted-foreground">{currentProfile.description}</p>
          )}
        </div>

        {/* Capture Progress */}
        {captureState.active && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <div className="flex justify-between text-sm">
              <span>Capturing...</span>
              <span>{captureState.samplesCollected} / {captureState.totalSamples}</span>
            </div>
            <Progress value={captureState.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(captureState.progress)}% complete
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {captureState.active ? (
            <Button
              onClick={onStopCapture}
              variant="destructive"
              className="flex-1"
              tabIndex={0}
              aria-label="Stop capture"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Capture
            </Button>
          ) : (
            <Button
              onClick={onStartCapture}
              disabled={!isConnected}
              className="flex-1"
              tabIndex={0}
              aria-label="Start capture"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Capture
            </Button>
          )}
        </div>

        {/* Calibration */}
        <Button
          onClick={onCalibrate}
          variant="outline"
          disabled={!isConnected || captureState.active}
          className="w-full"
          tabIndex={0}
          aria-label="Calibrate sensor"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Calibrate Sensor
        </Button>

        {/* Status Indicator */}
        {!isConnected && (
          <p className="text-xs text-center text-muted-foreground">
            Connect to a device to enable capture controls
          </p>
        )}
      </CardContent>
    </Card>
  );
}
