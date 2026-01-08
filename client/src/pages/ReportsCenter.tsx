/**
 * 📊 Reports Center - مركز التقارير
 * التقارير اليومية، الأسبوعية، الشهرية، نصف السنوية
 */

import { useState } from 'react';
import { FileText, Calendar, Download, TrendingUp } from 'lucide-react';

export default function ReportsCenter() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'semi_annual'>('daily');

  const reportTypes = [
    { id: 'daily', name: 'Daily', nameAr: 'يومي', icon: '📅', color: '#3B82F6' },
    { id: 'weekly', name: 'Weekly', nameAr: 'أسبوعي', icon: '📆', color: '#8B5CF6' },
    { id: 'monthly', name: 'Monthly', nameAr: 'شهري', icon: '📊', color: '#EC4899' },
    { id: 'semi_annual', name: 'Semi-Annual', nameAr: 'نصف سنوي', icon: '📈', color: '#F59E0B' }
  ];

  const sampleReports = [
    { id: '1', title: 'Daily Operations Report', date: '2025-06-10', type: 'daily', status: 'completed' },
    { id: '2', title: 'Weekly Performance Summary', date: '2025-06-09', type: 'weekly', status: 'completed' },
    { id: '3', title: 'Monthly Financial Report', date: '2025-06-01', type: 'monthly', status: 'completed' },
    { id: '4', title: 'H1 2025 Strategic Review', date: '2025-01-01', type: 'semi_annual', status: 'completed' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">📊</span>
          Reports Center
        </h1>
        <p className="text-gray-400 text-lg">مركز التقارير - جميع التقارير الإلزامية</p>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as any)}
            className={`p-6 rounded-lg border-2 transition-all ${
              reportType === type.id
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-4xl mb-2">{type.icon}</div>
            <div className="font-bold text-lg">{type.name}</div>
            <div className="text-sm text-gray-400">{type.nameAr}</div>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Recent Reports
        </h2>
        <div className="space-y-3">
          {sampleReports.map((report) => (
            <div key={report.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between hover:bg-gray-700/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold">{report.title}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2">
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
