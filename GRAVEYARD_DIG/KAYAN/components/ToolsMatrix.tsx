
import React from 'react';
import { Tool } from '../types';
import { Bot, BrainCircuit, Cog, Ear, Eye, GitBranch, Heart, Layers, MemoryStick, Package, Share2, Terminal } from './Icons';

interface ToolsMatrixProps {
  data: Tool[];
}

// A simple map to associate functions with icons
const toolIcons: { [key: string]: React.FC<{className?: string}> } = {
  'التفكير والاستنتاج': BrainCircuit,
  'الذاكرة طويلة الأمد': MemoryStick,
  'التنسيق والأتمتة': GitBranch,
  'الصوت (الإخراج)': Ear,
  'الصوت (الإدخال)': Ear,
  'الإدراك البصري (المحلي)': Eye,
  'الإدراك السمعي (المحلي)': Ear,
  'الاتصالات الخارجية': Share2,
  'التحكم بالمحيط': Cog,
  'الواجهة البصرية (AR)': Layers,
  'الحواس الحيوية (Bio)': Heart,
};


export const ToolsMatrix: React.FC<ToolsMatrixProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto bg-gray-800/40 border border-gray-700 rounded-lg">
      <table className="w-full text-right">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-4 font-bold text-lg text-gray-200">الوظيفة</th>
            <th className="p-4 font-bold text-lg text-gray-200">الأداة/التقنية الأساسية</th>
            <th className="p-4 font-bold text-lg text-gray-200">الدور في "كيان"</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((row, index) => {
            const Icon = toolIcons[row.function] || Bot;
            return (
              <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                <td className="p-4 align-top w-1/4">
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 text-teal-300 ml-3 flex-shrink-0" />
                    <span className="font-bold text-gray-200">{row.function}</span>
                  </div>
                </td>
                <td className="p-4 align-top w-1/4">
                  <span className="font-orbitron text-teal-300">{row.tool}</span>
                </td>
                <td className="p-4 align-top w-1/2 text-gray-300">{row.role}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
