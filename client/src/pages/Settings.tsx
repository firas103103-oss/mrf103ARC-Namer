/**
 * ⚙️ Settings - الإعدادات
 * إعدادات النظام والتكاملات
 */

import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Cpu } from 'lucide-react';

export default function Settings() {
  const [settings] = useState({
    autoReports: true,
    notificationsEnabled: true,
    learningEnabled: true,
    darkMode: true,
    language: 'en'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">⚙️</span>
          Settings
        </h1>
        <p className="text-gray-400 text-lg">إعدادات النظام</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* General Settings */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            General Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="font-semibold">Dark Mode</div>
                <div className="text-sm text-gray-400">Use dark theme</div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="font-semibold">Language</div>
                <div className="text-sm text-gray-400">Interface language</div>
              </div>
              <select className="px-4 py-2 bg-gray-700 rounded-lg">
                <option>English</option>
                <option>العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="font-semibold">Automatic Reports</div>
                <div className="text-sm text-gray-400">Generate reports automatically</div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="font-semibold">Push Notifications</div>
                <div className="text-sm text-gray-400">Receive alerts</div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Cpu className="w-6 h-6" />
            AI Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="font-semibold">Self-Learning</div>
                <div className="text-sm text-gray-400">Enable autonomous learning</div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
