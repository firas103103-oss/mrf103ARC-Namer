import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

export default function VirtualOffice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-black/40 backdrop-blur-xl border-secondary/30 mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">
              Virtual Office Platform
            </CardTitle>
            <CardDescription className="text-gray-300">
              Digital Twin Creation & Virtual Workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Digital Twin Creation</CardTitle>
                  <CardDescription className="text-gray-300">
                    Create your digital clone with voice, photos, and documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/cloning">
                    <Button className="w-full">
                      Go to Cloning System
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">IoT Integration</CardTitle>
                  <CardDescription className="text-gray-300">
                    Connect and manage your IoT devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">AI Integrations</CardTitle>
                  <CardDescription className="text-gray-300">
                    Connect with OpenAI, Anthropic, and more
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Virtual Workspace</CardTitle>
                  <CardDescription className="text-gray-300">
                    Collaborate in your virtual office
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-secondary/30">
          <CardHeader>
            <CardTitle className="text-white">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">1. Create Your Digital Twin</h3>
                <p>Upload voice samples, photos, and documents to create your digital clone.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">2. Connect IoT Devices</h3>
                <p>Integrate XBio Sentinel and other IoT devices for real-time data.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">3. AI Integration</h3>
                <p>Connect with AI services like OpenAI, Anthropic, and Google Gemini.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">4. Collaborate</h3>
                <p>Use the virtual workspace to collaborate with your team.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
