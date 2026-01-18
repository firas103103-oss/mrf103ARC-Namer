import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, TrendingUp } from "lucide-react";

interface DailyCheckInFormProps {
  onSuccess?: () => void;
}

export function DailyCheckInForm({ onSuccess }: DailyCheckInFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    tasksCompleted: 0,
    hoursWorked: "",
    moneySpent: "",
    wins: "",
    challenges: "",
    tomorrow: "",
    mood: "good",
    notes: "",
  });

  const submitCheckInMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/growth-roadmap/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to submit check-in");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/growth-roadmap/check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/growth-roadmap/overview"] });
      toast({
        title: "تم التسجيل!",
        description: "تم حفظ تسجيلك اليومي بنجاح",
      });
      // Reset form
      setFormData({
        tasksCompleted: 0,
        hoursWorked: "",
        moneySpent: "",
        wins: "",
        challenges: "",
        tomorrow: "",
        mood: "good",
        notes: "",
      });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCheckInMutation.mutate(formData);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          التسجيل اليومي
        </CardTitle>
        <CardDescription>
          سجل إنجازاتك وتحدياتك لهذا اليوم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tasksCompleted">عدد المهام المكتملة</Label>
              <Input
                id="tasksCompleted"
                type="number"
                min="0"
                value={formData.tasksCompleted}
                onChange={(e) =>
                  setFormData({ ...formData, tasksCompleted: parseInt(e.target.value) || 0 })
                }
                className="bg-gray-900 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursWorked">ساعات العمل</Label>
              <Input
                id="hoursWorked"
                type="number"
                step="0.5"
                min="0"
                value={formData.hoursWorked}
                onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                placeholder="8.0"
                className="bg-gray-900 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moneySpent">المصروفات ($)</Label>
              <Input
                id="moneySpent"
                type="number"
                step="0.01"
                min="0"
                value={formData.moneySpent}
                onChange={(e) => setFormData({ ...formData, moneySpent: e.target.value })}
                placeholder="0.00"
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">كيف كان يومك؟</Label>
            <Select
              value={formData.mood}
              onValueChange={(value) => setFormData({ ...formData, mood: value })}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="great">ممتاز 😄</SelectItem>
                <SelectItem value="good">جيد 🙂</SelectItem>
                <SelectItem value="okay">عادي 😐</SelectItem>
                <SelectItem value="bad">صعب 😔</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wins">الإنجازات (سطر لكل إنجاز)</Label>
            <Textarea
              id="wins"
              value={formData.wins}
              onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
              placeholder="- أكملت Business Plan&#10;- تواصلت مع 5 عملاء محتملين&#10;- نشرت مقال على المدونة"
              rows={4}
              className="bg-gray-900 border-gray-700 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">التحديات (سطر لكل تحدي)</Label>
            <Textarea
              id="challenges"
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              placeholder="- تأخر في الموافقة على التصاميم&#10;- مشكلة تقنية في النشر&#10;- احتاج مساعدة في التسويق"
              rows={4}
              className="bg-gray-900 border-gray-700 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tomorrow">أولويات الغد (سطر لكل أولوية)</Label>
            <Textarea
              id="tomorrow"
              value={formData.tomorrow}
              onChange={(e) => setFormData({ ...formData, tomorrow: e.target.value })}
              placeholder="- إكمال Pitch Deck&#10;- مراجعة Terms of Service&#10;- تحديث صفحة الأسعار"
              rows={4}
              className="bg-gray-900 border-gray-700 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات أو أفكار أخرى..."
              rows={3}
              className="bg-gray-900 border-gray-700"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            disabled={submitCheckInMutation.isPending}
          >
            <TrendingUp className="w-4 h-4 ml-2" />
            {submitCheckInMutation.isPending ? "جاري الحفظ..." : "حفظ التسجيل"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
