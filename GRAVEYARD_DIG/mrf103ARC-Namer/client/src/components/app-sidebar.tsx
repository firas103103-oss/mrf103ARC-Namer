import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Home,
  LayoutDashboard,
  Terminal,
  Activity,
  MessageSquare,
  Mic2,
  Users,
  Shield,
  BarChart3,
  LogOut,
  Search,
  Crosshair,
  Clock,
  Zap,
  Target,
  Workflow,
  TrendingUp,
  Network,
  Settings,
  Brain,
  Rocket,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  // I have kept your array definitions exactly as they were, 
  // just updating the description string to a translation key.
  const operationsItems = [
    { titleKey: "nav.home", url: "/", icon: Home, testId: "link-home", descKey: "nav.homeDesc" },
    { titleKey: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard, testId: "link-dashboard", descKey: "nav.dashboardDesc" },
    { titleKey: "nav.systemArchitecture", url: "/system-architecture", icon: Network, testId: "link-system-architecture", descKey: "nav.archDesc" },
    { titleKey: "nav.commandLogs", url: "/command-logs", icon: Terminal, testId: "link-command-logs", descKey: "nav.logsDesc" },
    { titleKey: "nav.systemMonitor", url: "/system-monitor", icon: Activity, testId: "link-system-monitor", descKey: "nav.monitorDesc" },
    { titleKey: "nav.teamCommand", url: "/team-command", icon: Target, testId: "link-team-command", descKey: "nav.teamDesc" },
    { titleKey: "nav.operationsSimulator", url: "/operations-simulator", icon: Workflow, testId: "link-operations-simulator", descKey: "nav.simDesc" },
    { titleKey: "nav.analyticsHub", url: "/analytics", icon: TrendingUp, testId: "link-analytics", descKey: "nav.analyticsDesc" },
  ];

  const communicationsItems = [
    { titleKey: "nav.voiceChat", url: "/voice-chat", icon: MessageSquare, testId: "link-voice-chat", descKey: "nav.voiceChatDesc" },
    { titleKey: "nav.voiceSelector", url: "/voice-selector", icon: Mic2, testId: "link-voice-selector", descKey: "nav.voiceSelectorDesc" },
    { titleKey: "nav.agentVoices", url: "/agent-voices", icon: Users, testId: "link-agent-voices", descKey: "nav.agentVoicesDesc" },
  ];

  const intelligenceItems = [
    { titleKey: "nav.investigationLounge", url: "/investigation-lounge", icon: Search, testId: "link-investigation-lounge", descKey: "nav.investigationDesc" },
    { titleKey: "nav.quantumWarroom", url: "/quantum-warroom", icon: Crosshair, testId: "link-quantum-warroom", descKey: "nav.warroomDesc" },
    { titleKey: "nav.temporalAnomalyLab", url: "/temporal-anomaly-lab", icon: Clock, testId: "link-temporal-anomaly-lab", descKey: "nav.temporalDesc" },
    { titleKey: "nav.selfCheck", url: "/self-check", icon: Shield, testId: "link-self-check", descKey: "nav.selfCheckDesc" },
    { titleKey: "nav.metrics", url: "/metrics", icon: BarChart3, testId: "link-metrics", descKey: "nav.metricsDesc" },
  ];

  const bioSentinelItems = [
    { titleKey: "nav.bioSentinel", url: "/bio-sentinel", icon: Zap, testId: "link-bio-sentinel", descKey: "nav.bioSentinelDesc" },
  ];

  const adminItems = [
    { titleKey: "nav.adminPanel", url: "/admin", icon: Settings, testId: "link-admin", descKey: "nav.adminDesc" },
    { titleKey: "nav.masterAgent", url: "/master-agent", icon: Brain, testId: "link-master-agent", descKey: "nav.masterAgentDesc" },
    { titleKey: "nav.growthRoadmap", url: "/growth-roadmap", icon: Rocket, testId: "link-growth-roadmap", descKey: "nav.roadmapDesc" },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.email || "User";
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
            ARC
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">
              {t('app.title', 'ARC Virtual Office')}
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              {t('common.commandCenter')}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Operations Group - Fully preserved structure */}
        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-operations">
            {t('nav.operations')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                    title={t(item.descKey)}
                    className="group relative"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                      <span className="text-[10px] text-muted-foreground/60 hidden group-hover:inline ml-2">
                        ({t(item.descKey)})
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Communications Group - Fully preserved structure */}
        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-communications">
            {t('nav.communications')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationsItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                    title={t(item.descKey)}
                    className="group relative"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                      <span className="text-[10px] text-muted-foreground/60 hidden group-hover:inline ml-2">
                        ({t(item.descKey)})
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Intelligence Group - Fully preserved structure */}
        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-intelligence">
            {t('nav.intelligence')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {intelligenceItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                    title={t(item.descKey)}
                    className="group relative"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                      <span className="text-[10px] text-muted-foreground/60 hidden group-hover:inline ml-2">
                        ({t(item.descKey)})
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bio Sentinel Group - Fully preserved structure */}
        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-bio-sentinel">
            {t('nav.bioSentinel', 'Bio Sentinel')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bioSentinelItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                    title={t(item.descKey)}
                    className="group relative"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                      <span className="text-[10px] text-muted-foreground/60 hidden group-hover:inline ml-2">
                        ({t(item.descKey)})
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration Group - Fully preserved structure */}
        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-administration">
            {t('nav.administration')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                    title={t(item.descKey)}
                    className="group relative"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                      <span className="text-[10px] text-muted-foreground/60 hidden group-hover:inline ml-2">
                        ({t(item.descKey)})
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9" data-testid="avatar-user">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={getUserDisplayName()} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span
              className="truncate text-sm font-medium text-sidebar-foreground"
              data-testid="text-user-name"
            >
              {getUserDisplayName()}
            </span>
            {user?.email && (
              <span
                className="truncate text-xs text-sidebar-foreground/70"
                data-testid="text-user-email"
              >
                {user.email}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-sidebar-foreground/70"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">{t('nav.logout')}</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
