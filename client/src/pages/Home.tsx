import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Zap,
  LayoutDashboard,
  Users,
  BarChart3,
  Radio,
  Shield,
  Activity,
  Brain,
  Cpu,
  Settings,
  ArrowRight,
  Wifi,
  FlaskConical,
  Smartphone,
  Download,
} from "lucide-react";

interface QuickAccessCard {
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  href: string;
  color: string;
  badge?: string;
}

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const quickAccessCards: QuickAccessCard[] = [
    {
      titleKey: "nav.bioSentinel",
      descriptionKey: "bioSentinel.subtitle",
      icon: Zap,
      href: "/bio-sentinel",
      color: "text-chart-4",
      badge: "IoT",
    },
    {
      titleKey: "nav.dashboard",
      descriptionKey: "dashboard.subtitle",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-primary",
    },
    {
      titleKey: "nav.teamCommand",
      descriptionKey: "teamCommand.subtitle",
      icon: Users,
      href: "/team-command",
      color: "text-secondary",
    },
    {
      titleKey: "nav.analyticsHub",
      descriptionKey: "analytics.subtitle",
      icon: BarChart3,
      href: "/analytics",
      color: "text-chart-3",
    },
    {
      titleKey: "nav.voiceChat",
      descriptionKey: "voiceChat.subtitle",
      icon: Radio,
      href: "/voice-chat",
      color: "text-primary",
    },
    {
      titleKey: "nav.operationsSimulator",
      descriptionKey: "operations.subtitle",
      icon: Cpu,
      href: "/operations-simulator",
      color: "text-secondary",
    },
  ];

  const systemStats = [
    { label: t("dashboard.activeAgents"), value: "10", icon: Brain, color: "text-secondary" },
    { label: t("common.systemOnline"), value: "99.9%", icon: Activity, color: "text-secondary" },
    { label: t("common.secure"), value: "AES-256", icon: Shield, color: "text-primary" },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{t("landing.title")}</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-6">
    <div className="space-y-8 max-w-7xl mx-auto w-full" data-testid="page-home">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground" data-testid="text-welcome">
            {t("landing.title")}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            {user?.firstName ? `${t("common.online")}, ${user.firstName}` : t("common.commandCenter")} - {t("landing.missionCriticalFeatures")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
            <Activity className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
            {t("common.online")}
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Shield className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
            {t("common.secure")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {systemStats.map((stat, index) => (
          <Card key={index} className="bg-card/50" data-testid={`card-stat-${index}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-md bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-chart-4/5" data-testid="card-bio-sentinel-featured">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-md bg-chart-4/10 border border-chart-4/20">
                <Zap className="h-8 w-8 text-chart-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    {t("nav.bioSentinel")}
                  </h2>
                  <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/30 text-[10px]">
                    ESP32-S3
                  </Badge>
                </div>
                <p className="text-muted-foreground max-w-md">
                  {t("bioSentinel.subtitle")}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FlaskConical className="h-4 w-4" />
                    BME688
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    WebSocket
                  </span>
                  <span className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    AI Analysis
                  </span>
                </div>
              </div>
            </div>
            <Button asChild data-testid="button-open-bio-sentinel">
              <Link href="/bio-sentinel">
                {t("landing.viewCapabilities")}
                <ArrowRight className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4" data-testid="text-quick-access">
          {t("landing.operationalCapabilities")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickAccessCards.map((card, index) => (
            <Link key={index} href={card.href} data-testid={`link-quick-access-${card.href.replace('/', '')}`}>
              <Card 
                className="h-full cursor-pointer transition-all duration-200 hover-elevate bg-card/50 border-border"
                data-testid={`card-quick-access-${index}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-md bg-muted ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    {card.badge && (
                      <Badge variant="outline" className="text-[10px] bg-muted/50">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{t(card.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {t(card.descriptionKey)}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-muted/30" data-testid="card-agent-fleet">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t("landing.multiAgentFleet")}</CardTitle>
          </div>
          <CardDescription>{t("landing.multiAgentFleetDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: "Mr.F", role: "Executive", status: "active" },
              { name: "L0-Ops", role: "Operations", status: "active" },
              { name: "L0-Comms", role: "Communications", status: "active" },
              { name: "L0-Intel", role: "Intelligence", status: "active" },
              { name: "Alex Vision", role: "Photography", status: "standby" },
              { name: "Diana Grant", role: "Grants", status: "standby" },
              { name: "Marcus Law", role: "Legal", status: "standby" },
              { name: "Sarah Numbers", role: "Finance", status: "active" },
              { name: "Jordan Spark", role: "Creative", status: "active" },
              { name: "Dr. Maya Quest", role: "Research", status: "active" },
            ].map((agent, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md bg-card/50 border border-border"
                data-testid={`agent-${agent.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                      agent.status === "active" ? "bg-secondary" : "bg-muted-foreground"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-chart-3/20 bg-gradient-to-r from-chart-3/5 to-primary/5" data-testid="card-android-download">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-md bg-chart-3/10 border border-chart-3/20">
                <Smartphone className="h-8 w-8 text-chart-3" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    {t("landing.androidApp") || "Android App"}
                  </h2>
                  <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/30 text-[10px]">
                    Capacitor
                  </Badge>
                </div>
                <p className="text-muted-foreground max-w-md">
                  {t("landing.androidAppDesc") || "Download the Android project to build and install the ARC Intelligence app on your mobile device."}
                </p>
              </div>
            </div>
            <Button asChild data-testid="button-download-android">
              <a href="/api/android/download" download>
                <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {t("common.download") || "Download"}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
