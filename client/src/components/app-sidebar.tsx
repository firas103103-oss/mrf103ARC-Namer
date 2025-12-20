import { Link, useLocation } from "wouter";
import {
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

const operationsItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Command Logs",
    url: "/command-logs",
    icon: Terminal,
    testId: "link-command-logs",
  },
  {
    title: "System Monitor",
    url: "/system-monitor",
    icon: Activity,
    testId: "link-system-monitor",
  },
];

const communicationsItems = [
  {
    title: "Voice Chat",
    url: "/voice-chat",
    icon: MessageSquare,
    testId: "link-voice-chat",
  },
  {
    title: "Voice Selector",
    url: "/voice-selector",
    icon: Mic2,
    testId: "link-voice-selector",
  },
  {
    title: "Agent Voices",
    url: "/agent-voices",
    icon: Users,
    testId: "link-agent-voices",
  },
];

const intelligenceItems = [
  {
    title: "Investigation Lounge",
    url: "/investigation-lounge",
    icon: Search,
    testId: "link-investigation-lounge",
  },
  {
    title: "Quantum WarRoom",
    url: "/quantum-warroom",
    icon: Crosshair,
    testId: "link-quantum-warroom",
  },
  {
    title: "Temporal Anomaly Lab",
    url: "/temporal-anomaly-lab",
    icon: Clock,
    testId: "link-temporal-anomaly-lab",
  },
  {
    title: "Self Check",
    url: "/self-check",
    icon: Shield,
    testId: "link-self-check",
  },
  {
    title: "Metrics",
    url: "/metrics",
    icon: BarChart3,
    testId: "link-metrics",
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

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
              ARC Virtual Office
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              Command Center
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-operations">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-communications">
            Communications
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-intelligence">
            Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {intelligenceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
