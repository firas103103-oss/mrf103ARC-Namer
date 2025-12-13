import { Button } from "@/components/ui/button";
import { Building2, LogIn, Zap, Users, Brain } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold" data-testid="text-logo">ARC Virtual Office</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-3xl text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Building2 className="h-20 w-20 text-primary" />
            </div>
            <h1 
              className="text-4xl md:text-5xl font-bold tracking-tight"
              data-testid="text-hero-title"
            >
              ARC Virtual Office
            </h1>
            <p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              data-testid="text-hero-subtitle"
            >
              An AI-powered enterprise orchestration system. Collaborate with specialized AI agents to streamline your workflows and boost productivity.
            </p>
          </div>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              asChild
              data-testid="button-login"
            >
              <a href="/api/login">
                <LogIn className="h-5 w-5 mr-2" />
                Sign In to Get Started
              </a>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="p-6 rounded-md bg-muted/50">
              <div className="flex justify-center mb-4">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold mb-2" data-testid="text-feature-ai">AI-Powered Agents</h3>
              <p className="text-sm text-muted-foreground">
                Chat with specialized AI agents tailored for different business functions
              </p>
            </div>
            <div className="p-6 rounded-md bg-muted/50">
              <div className="flex justify-center mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold mb-2" data-testid="text-feature-collab">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Multiple agents working together to solve complex problems
              </p>
            </div>
            <div className="p-6 rounded-md bg-muted/50">
              <div className="flex justify-center mb-4">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold mb-2" data-testid="text-feature-efficiency">Streamlined Workflows</h3>
              <p className="text-sm text-muted-foreground">
                Automate and optimize your enterprise processes effortlessly
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t p-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p data-testid="text-footer">ARC Virtual Office - Enterprise AI Orchestration</p>
        </div>
      </footer>
    </div>
  );
}
