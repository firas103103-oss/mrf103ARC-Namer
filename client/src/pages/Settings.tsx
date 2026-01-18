/**
 * ⚙️ Settings - الإعدادات
 * إعدادات النظام والتكاملات
 * ✅ متصل بـ Backend API
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { renderLoading } from '@/lib/apiHooks';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Cpu, RefreshCw } from 'lucide-react';

export default function Settings() {
  const { data: settingsData, isLoading, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/settings');
      return (response as any).data || response;
    },
    refetchInterval: 30000
  });

  const settings = (settingsData as any)?.data || settingsData || {
    general: { darkMode: true, language: 'en' },
    notifications: { enabled: true, emailNotifications: true },
    system: { autoReports: true, learningEnabled: true }
  };

  if (isLoading) {
    return renderLoading('Loading Settings...');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">⚙️</span>
              Settings
            </h1>
            <p className="text-muted-foreground text-lg">إعدادات النظام</p>
          </div>
          <button onClick={() => refetch()} className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors" title="Refresh Settings">
            <RefreshCw className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* General Settings */}
        <div className="bg-card/50 rounded-lg p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            General Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Use dark theme</div>
              </div>
              <div className={`w-12 h-6 ${settings.general.darkMode ? 'bg-primary' : 'bg-gray-600'} rounded-full relative cursor-pointer`}>
                <div className={`absolute ${settings.general.darkMode ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold">Language</div>
                <div className="text-sm text-muted-foreground">Interface language: {settings.general.language}</div>
              </div>
              <select className="px-4 py-2 bg-muted rounded-lg">
                <option>English</option>
                <option>العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card/50 rounded-lg p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold">Automatic Reports</div>
                <div className="text-sm text-muted-foreground">Generate reports automatically</div>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold">Push Notifications</div>
                <div className="text-sm text-muted-foreground">Receive alerts</div>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-card/50 rounded-lg p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Cpu className="w-6 h-6" />
            AI Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold">Self-Learning</div>
                <div className="text-sm text-muted-foreground">Enable autonomous learning</div>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
