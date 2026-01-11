import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Video, Calendar } from 'lucide-react';

export default function VirtualOffice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Virtual Office</h1>
          <p className="text-gray-300">Collaborative workspace powered by your digital twin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border-secondary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Team Collaboration</CardTitle>
              <CardDescription className="text-gray-400">
                Work together with your team in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                Enter Workspace
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-secondary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">AI Assistant</CardTitle>
              <CardDescription className="text-gray-400">
                Chat with your digital twin assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-secondary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-white">Video Meetings</CardTitle>
              <CardDescription className="text-gray-400">
                Host virtual meetings with smart features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-secondary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle className="text-white">Calendar</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your schedule and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-black/40 backdrop-blur-xl border-secondary/30">
            <CardHeader>
              <CardTitle className="text-white">Getting Started</CardTitle>
              <CardDescription className="text-gray-400">
                Complete your digital twin setup to unlock all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <span className="text-gray-300">Profile created</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
                  <span className="text-gray-400">2</span>
                </div>
                <span className="text-gray-400">Upload voice samples (coming soon)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
                  <span className="text-gray-400">3</span>
                </div>
                <span className="text-gray-400">Connect IoT devices (coming soon)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
