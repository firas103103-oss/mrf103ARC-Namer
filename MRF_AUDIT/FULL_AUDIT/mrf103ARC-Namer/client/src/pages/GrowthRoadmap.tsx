import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  AlertCircle,
  Trophy,
  Rocket,
  PlayCircle,
  CheckSquare,
  XCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DailyCheckInForm } from "@/components/DailyCheckInForm";

interface GrowthPhase {
  id: string;
  phaseNumber: number;
  name: string;
  description: string;
  startWeek: number;
  endWeek: number;
  targetScore: number;
  budget: string;
  status: string;
  actualScore: number | null;
  completedAt: string | null;
}

interface GrowthTask {
  id: string;
  weekId: string;
  phaseId: string;
  dayNumber: number;
  title: string;
  description: string;
  category: string;
  estimatedHours: string;
  deliverables: string;
  resources: string;
  cost: string;
  priority: string;
  status: string;
  progress: number;
  actualHours: string | null;
  actualCost: string | null;
  notes: string | null;
  blockers: string | null;
  startedAt: string | null;
  completedAt: string | null;
  dueDate: string | null;
}

interface GrowthMetrics {
  id: string;
  date: string;
  weekNumber: number;
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  mrr: string;
  arr: string;
  payingCustomers: number;
  websiteVisitors: number;
  emailSubscribers: number;
  blogPosts: number;
  socialFollowers: number;
  featureCount: number;
  bugCount: number;
  uptime: string;
  technicalScore: number;
  businessScore: number;
  operationalScore: number;
  polishScore: number;
  totalScore: number;
}

interface DailyCheckIn {
  id: string;
  date: string;
  tasksCompleted: number;
  hoursWorked: string;
  moneySpent: string;
  wins: string;
  challenges: string;
  tomorrow: string;
  mood: string;
  notes: string;
}

interface GrowthOverview {
  phases: GrowthPhase[];
  weeks: any[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    totalHours: number;
    totalCost: number;
  };
  currentScore: number;
  targetScore: number;
}

interface TodayData {
  currentDay: number;
  todaysTasks: GrowthTask[];
  inProgressTasks: GrowthTask[];
  weekNumber: number;
  phaseName: string;
}

export default function GrowthRoadmap() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch overview data
  const { data: overview } = useQuery<GrowthOverview>({
    queryKey: ["/api/growth-roadmap/overview"],
  });

  // Fetch today's tasks
  const { data: todayData } = useQuery<TodayData>({
    queryKey: ["/api/growth-roadmap/today"],
  });

  // Fetch latest metrics
  const { data: latestMetrics } = useQuery<GrowthMetrics>({
    queryKey: ["/api/growth-roadmap/metrics/latest"],
  });

  // Fetch check-ins
  const { data: checkIns } = useQuery<DailyCheckIn[]>({
    queryKey: ["/api/growth-roadmap/check-ins"],
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const response = await fetch(`/api/growth-roadmap/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/growth-roadmap/overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/growth-roadmap/today"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة المهمة بنجاح",
      });
    },
  });

  // Initialize data mutation
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/growth-roadmap/initialize", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to initialize");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/growth-roadmap/overview"] });
      toast({
        title: "تم التهيئة",
        description: "تم تهيئة خطة الـ 90 يوم بنجاح",
      });
    },
  });

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });
  };

  const handleTaskProgressChange = (taskId: string, progress: number) => {
    updateTaskMutation.mutate({ taskId, updates: { progress } });
  };

  const currentScore = latestMetrics?.totalScore || 72;
  const targetScore = 95;
  const progressPercentage = Math.round(((currentScore - 72) / (95 - 72)) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "in-progress":
        return "bg-primary";
      case "blocked":
        return "bg-destructive";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">خطة النمو - 90 يوم</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Rocket className="w-10 h-10 text-primary" />
              خطة النمو - 90 يوم
            </h1>
            <p className="text-muted-foreground text-lg">
              رحلتك من 72/100 إلى 95/100 | جاهز للاستثمار
            </p>
          </div>
          
          {(!overview || overview.phases?.length === 0) && (
            <Button
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Zap className="w-4 h-4 ml-2" />
              تهيئة الخطة
            </Button>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                النتيجة الحالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{currentScore}/100</div>
              <Progress value={progressPercentage} className="mt-2 h-2" />
              <p className="text-xs text-gray-500 mt-1">الهدف: {targetScore}/100</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                المهام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {overview?.stats?.completedTasks || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                من {overview?.stats?.totalTasks || 0} مهمة
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {latestMetrics?.activeUsers || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                مستخدم نشط
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                ${latestMetrics?.mrr || "0"}
              </div>
              <p className="text-xs text-gray-500 mt-1">MRR شهري</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-card/50 border border-border">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="today">مهام اليوم</TabsTrigger>
            <TabsTrigger value="phases">المراحل</TabsTrigger>
            <TabsTrigger value="metrics">المقاييس</TabsTrigger>
            <TabsTrigger value="checkin">تسجيل يومي</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  المراحل الثلاث
                </CardTitle>
                <CardDescription>
                  تقدمك عبر مراحل الخطة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {overview?.phases?.map((phase: GrowthPhase) => (
                  <div
                    key={phase.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl font-bold text-gray-500">
                        {phase.phaseNumber}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{phase.name}</h3>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            أسبوع {phase.startWeek}-{phase.endWeek}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${phase.budget}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            هدف: {phase.targetScore}/100
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(phase.status)}>
                      {phase.status === "completed" && "مكتمل"}
                      {phase.status === "in-progress" && "جاري"}
                      {phase.status === "not-started" && "لم يبدأ"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  الجدول الزمني
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overview?.weeks?.slice(0, 5).map((week: any, index: number) => (
                    <div
                      key={week.id}
                      className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                        {week.weekNumber}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{week.name}</h4>
                        <p className="text-xs text-gray-500">{week.description}</p>
                      </div>
                      <Badge variant={week.status === "completed" ? "default" : "outline"}>
                        {week.status === "completed" && <CheckCircle2 className="w-3 h-3 ml-1" />}
                        {week.status === "in-progress" && <Clock className="w-3 h-3 ml-1" />}
                        {week.status === "not-started" && <Circle className="w-3 h-3 ml-1" />}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-4">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" />
                  مهام اليوم {todayData?.currentDay || 1}
                </CardTitle>
                <CardDescription>
                  المهام المجدولة لليوم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayData?.todaysTasks?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد مهام مجدولة لهذا اليوم</p>
                  </div>
                )}
                
                {todayData?.todaysTasks?.map((task: GrowthTask) => (
                  <div
                    key={task.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-border space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold">{task.title}</h3>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">{task.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedHours} ساعات
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${task.cost}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Progress value={task.progress} className="h-2" />

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={task.status === "not-started" ? "default" : "outline"}
                        onClick={() => handleTaskStatusChange(task.id, "in-progress")}
                        disabled={task.status === "completed"}
                      >
                        <PlayCircle className="w-3 h-3 ml-1" />
                        ابدأ
                      </Button>
                      <Button
                        size="sm"
                        variant={task.status === "completed" ? "default" : "outline"}
                        onClick={() => handleTaskStatusChange(task.id, "completed")}
                        disabled={task.status === "completed"}
                      >
                        <CheckCircle2 className="w-3 h-3 ml-1" />
                        اكتمل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTaskStatusChange(task.id, "blocked")}
                      >
                        <XCircle className="w-3 h-3 ml-1" />
                        محظور
                      </Button>
                    </div>
                  </div>
                ))}

                {/* In Progress Tasks */}
                {todayData?.inProgressTasks && todayData.inProgressTasks.length > 0 && (
                  <>
                    <div className="pt-4 border-t border-border">
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        مهام قيد التنفيذ
                      </h3>
                    </div>
                    {todayData.inProgressTasks.map((task: GrowthTask) => (
                      <div
                        key={task.id}
                        className="p-3 bg-primary/10 rounded-lg border border-primary/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className="bg-primary">جاري</Badge>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          اليوم {task.dayNumber} • {task.category}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-4">
            {overview?.phases?.map((phase: GrowthPhase) => (
              <Card key={phase.id} className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-500">
                        المرحلة {phase.phaseNumber}
                      </span>
                      {phase.name}
                    </span>
                    <Badge className={getStatusColor(phase.status)}>
                      {phase.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">الفترة</div>
                      <div className="font-bold">
                        أسبوع {phase.startWeek}-{phase.endWeek}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">الميزانية</div>
                      <div className="font-bold text-warning">${phase.budget}</div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">النتيجة المستهدفة</div>
                      <div className="font-bold text-success">{phase.targetScore}/100</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-success" />
                  مقاييس الأداء
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">المستخدمين الكلي</div>
                      <div className="text-2xl font-bold">{latestMetrics.totalUsers}</div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">MRR</div>
                      <div className="text-2xl font-bold text-success">
                        ${latestMetrics.mrr}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">زوار الموقع</div>
                      <div className="text-2xl font-bold">{latestMetrics.websiteVisitors}</div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">النتيجة التقنية</div>
                      <div className="text-2xl font-bold text-primary">
                        {latestMetrics.technicalScore}/50
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">النتيجة التجارية</div>
                      <div className="text-2xl font-bold text-secondary">
                        {latestMetrics.businessScore}/20
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">النتيجة الإجمالية</div>
                      <div className="text-2xl font-bold text-warning">
                        {latestMetrics.totalScore}/100
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد بيانات متاحة
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in Tab */}
          <TabsContent value="checkin" className="space-y-4">
            <DailyCheckInForm />

            {/* Recent Check-ins */}
            {checkIns && checkIns.length > 0 && (
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle>التسجيلات السابقة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checkIns.slice(0, 5).map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="p-3 bg-gray-900/50 rounded-lg border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          {new Date(checkIn.date).toLocaleDateString("ar")}
                        </div>
                        <Badge variant="outline">{checkIn.mood}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {checkIn.tasksCompleted} مهمة • {checkIn.hoursWorked} ساعات
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
