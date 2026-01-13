/**
 * 🔌 Integrations - التكاملات الخارجية
 * Google Drive, OneDrive, Dropbox, iCloud, Computer Access
 */

import { useState } from 'react';
import { Cloud, HardDrive, CheckCircle, XCircle, Plus } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'disconnected';
  color: string;
  description: string;
}

export default function Integrations() {
  const [integrations] = useState<Integration[]>([
    {
      id: 'google_drive',
      name: 'Google Drive',
      icon: '📁',
      status: 'connected',
      color: '#4285F4',
      description: 'Access and sync Google Drive files'
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '☁️',
      status: 'connected',
      color: '#0078D4',
      description: 'Microsoft OneDrive integration'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      status: 'disconnected',
      color: '#0061FF',
      description: 'Dropbox file storage'
    },
    {
      id: 'icloud',
      name: 'iCloud',
      icon: '☁️',
      status: 'disconnected',
      color: '#3693F3',
      description: 'Apple iCloud Drive'
    },
    {
      id: 'local_pc',
      name: 'Local Computer',
      icon: '💻',
      status: 'connected',
      color: 'hsl(var(--success))',
      description: 'Access local computer files'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">🔌</span>
              Integrations
            </h1>
            <p className="text-muted-foreground text-lg">التكاملات الخارجية - Cloud Drives & Local Access</p>
          </div>
          <button className="px-6 py-3 bg-primary rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Integration
          </button>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div 
            key={integration.id}
            className="bg-card/50 rounded-lg p-6 border border-border hover:border-gray-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${integration.color}20` }}
                >
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{integration.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {integration.status === 'connected' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-xs text-success font-semibold">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500 font-semibold">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

            <button
              className={`w-full py-2 rounded-lg font-semibold transition-all ${
                integration.status === 'connected'
                  ? 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30'
                  : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
              }`}
            >
              {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      {/* Permissions Section */}
      <div className="mt-8 bg-card/50 rounded-lg p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <HardDrive className="w-6 h-6" />
          Integration Permissions
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-semibold">Read Files</div>
              <div className="text-sm text-muted-foreground">Allow agents to read files from integrations</div>
            </div>
            <div className="w-12 h-6 bg-success rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-semibold">Write Files</div>
              <div className="text-sm text-muted-foreground">Allow agents to modify files</div>
            </div>
            <div className="w-12 h-6 bg-success rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-semibold">Auto Sync</div>
              <div className="text-sm text-muted-foreground">Automatically sync changes</div>
            </div>
            <div className="w-12 h-6 bg-success rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
