/**
 * 📊 Reports Center - مركز التقارير
 * التقارير اليومية، الأسبوعية، الشهرية، نصف السنوية
 * ✅ متصل بـ Backend API
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { renderLoading } from '@/lib/apiHooks';
import { FileText, Calendar, Download, TrendingUp, RefreshCw } from 'lucide-react';

export default function ReportsCenter() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'semi_annual'>('daily');

  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ['reports', reportType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/reports/${reportType}`);
      return (response as any).data || response;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const reports = (reportsData as any)?.data || reportsData || [];

  const reportTypes = [
    { id: 'daily', name: 'Daily', nameAr: 'يومي', icon: '📅', color: 'hsl(var(--primary))' },
    { id: 'weekly', name: 'Weekly', nameAr: 'أسبوعي', icon: '📆', color: 'hsl(var(--secondary))' },
    { id: 'monthly', name: 'Monthly', nameAr: 'شهري', icon: '📊', color: 'hsl(var(--accent))' },
    { id: 'semi_annual', name: 'Semi-Annual', nameAr: 'نصف سنوي', icon: '📈', color: 'hsl(var(--warning))' }
  ];

  if (isLoading) {
    return renderLoading('Loading Reports...');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">📊</span>
              Reports Center
            </h1>
            <p className="text-muted-foreground text-lg">مركز التقارير - جميع التقارير الإلزامية</p>
          </div>
          <button onClick={() => refetch()} className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors" title="Refresh Reports">
            <RefreshCw className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as any)}
            className={`p-6 rounded-lg border-2 transition-all ${
              reportType === type.id
                ? 'border-primary bg-primary/20'
                : 'border-border bg-card/50 hover:border-gray-600'
            }`}
          >
            <div className="text-4xl mb-2">{type.icon}</div>
            <div className="font-bold text-lg">{type.name}</div>
            <div className="text-sm text-muted-foreground">{type.nameAr}</div>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-card/50 rounded-lg p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Recent Reports
        </h2>
        <div className="space-y-3">
          {reports.map((report: any) => (
            <div key={report.id} className="p-4 bg-muted/30 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{report.title}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
