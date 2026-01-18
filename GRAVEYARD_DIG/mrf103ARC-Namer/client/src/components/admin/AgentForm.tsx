/**
 * Agent Form Component
 * Form for creating/editing AI agents
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bot,
  Plus,
  Save,
  Loader2,
  X,
} from "lucide-react";
import { type Agent, MODEL_OPTIONS, DEFAULT_AGENT_FORM } from "./types";

interface AgentFormProps {
  initialData?: Partial<Agent>;
  onSubmit: (agent: Partial<Agent>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function AgentForm({ 
  initialData = DEFAULT_AGENT_FORM, 
  onSubmit, 
  onCancel,
  isLoading,
  mode = "create" 
}: AgentFormProps) {
  const [form, setForm] = useState<Partial<Agent>>(initialData);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCapability, setNewCapability] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setForm(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), newSpecialization.trim()],
      }));
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (index: number) => {
    setForm(prev => ({
      ...prev,
      specializations: prev.specializations?.filter((_, i) => i !== index),
    }));
  };

  const addCapability = () => {
    if (newCapability.trim()) {
      setForm(prev => ({
        ...prev,
        capabilities: [...(prev.capabilities || []), newCapability.trim()],
      }));
      setNewCapability("");
    }
  };

  const removeCapability = (index: number) => {
    setForm(prev => ({
      ...prev,
      capabilities: prev.capabilities?.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {mode === "create" ? "Create New Agent" : "Edit Agent"}
        </CardTitle>
        <CardDescription>
          Configure AI agent settings and capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Name</Label>
              <Input
                id="agent-name"
                placeholder="Agent Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                tabIndex={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-role">Role</Label>
              <Input
                id="agent-role"
                placeholder="e.g., Sales Assistant"
                value={form.role || ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
                tabIndex={0}
              />
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              placeholder="Define the agent's behavior and instructions..."
              value={form.systemPrompt || ""}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              rows={4}
              tabIndex={0}
            />
          </div>

          {/* Model Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={form.model}
                onValueChange={(value) => setForm({ ...form, model: value })}
              >
                <SelectTrigger id="model" tabIndex={0}>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens: {form.maxTokens}</Label>
              <Slider
                id="max-tokens"
                value={[form.maxTokens || 4000]}
                onValueChange={([value]) => setForm({ ...form, maxTokens: value })}
                min={500}
                max={8000}
                step={100}
                tabIndex={0}
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature: {form.temperature?.toFixed(2)}</Label>
            <Slider
              id="temperature"
              value={[form.temperature || 0.7]}
              onValueChange={([value]) => setForm({ ...form, temperature: value })}
              min={0}
              max={2}
              step={0.05}
              tabIndex={0}
            />
            <p className="text-xs text-muted-foreground">
              Lower = more focused, Higher = more creative
            </p>
          </div>

          {/* Specializations */}
          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add specialization..."
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())}
                tabIndex={0}
              />
              <Button type="button" onClick={addSpecialization} size="icon" tabIndex={0}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.specializations?.map((spec, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(index)}
                    className="ml-1 hover:text-destructive"
                    tabIndex={0}
                    aria-label={`Remove ${spec}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-2">
            <Label>Capabilities</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add capability..."
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCapability())}
                tabIndex={0}
              />
              <Button type="button" onClick={addCapability} size="icon" tabIndex={0}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.capabilities?.map((cap, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {cap}
                  <button
                    type="button"
                    onClick={() => removeCapability(index)}
                    className="ml-1 hover:text-destructive"
                    tabIndex={0}
                    aria-label={`Remove ${cap}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="active"
              checked={form.active}
              onCheckedChange={(checked) => setForm({ ...form, active: checked })}
            />
            <Label htmlFor="active">Agent Active</Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1" tabIndex={0}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mode === "create" ? "Create Agent" : "Save Changes"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} tabIndex={0}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
