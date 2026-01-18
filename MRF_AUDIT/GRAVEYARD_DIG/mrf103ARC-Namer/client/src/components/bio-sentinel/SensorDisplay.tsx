/**
 * Sensor Display Component
 * Shows real-time sensor readings with gauges and metrics
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Flame,
} from "lucide-react";
import { type SensorReading, getIaqLevel } from "./types";

interface SensorDisplayProps {
  reading: SensorReading | null;
  className?: string;
}

export function SensorDisplay({ reading, className }: SensorDisplayProps) {
  if (!reading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sensor Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No sensor data available. Connect a device to start monitoring.
          </p>
        </CardContent>
      </Card>
    );
  }

  const iaqLevel = getIaqLevel(reading.iaqScore);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sensor Readings
          </div>
          <Badge className={`${iaqLevel.bg} ${iaqLevel.color}`}>
            IAQ: {iaqLevel.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* IAQ Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Indoor Air Quality</span>
            <span className={iaqLevel.color}>{reading.iaqScore} / 500</span>
          </div>
          <Progress 
            value={(reading.iaqScore / 500) * 100} 
            className="h-3"
          />
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            icon={<Thermometer className="h-4 w-4" />}
            label="Temperature"
            value={`${reading.temperature.toFixed(1)}°C`}
            subValue={`${(reading.temperature * 9/5 + 32).toFixed(1)}°F`}
          />
          <MetricCard
            icon={<Droplets className="h-4 w-4" />}
            label="Humidity"
            value={`${reading.humidity.toFixed(1)}%`}
            subValue="Relative"
          />
          <MetricCard
            icon={<Wind className="h-4 w-4" />}
            label="Pressure"
            value={`${(reading.pressure / 100).toFixed(1)} hPa`}
            subValue="Atmospheric"
          />
          <MetricCard
            icon={<Flame className="h-4 w-4" />}
            label="Gas Resistance"
            value={`${(reading.gasResistance / 1000).toFixed(1)} kΩ`}
            subValue="VOC Indicator"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">CO₂ Equiv.</p>
            <p className="text-lg font-semibold">{reading.co2Equivalent} ppm</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">VOC Equiv.</p>
            <p className="text-lg font-semibold">{reading.vocEquivalent} ppm</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">IAQ Accuracy</p>
            <p className="text-lg font-semibold">{reading.iaqAccuracy}/3</p>
          </div>
        </div>

        {/* Heater Status */}
        <div className="flex items-center justify-between pt-4 border-t text-sm">
          <span className="text-muted-foreground">Heater</span>
          <span>
            {reading.heaterTemperature}°C / {reading.heaterDuration}ms
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}

function MetricCard({ icon, label, value, subValue }: MetricCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <div className="p-2 rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </div>
  );
}
