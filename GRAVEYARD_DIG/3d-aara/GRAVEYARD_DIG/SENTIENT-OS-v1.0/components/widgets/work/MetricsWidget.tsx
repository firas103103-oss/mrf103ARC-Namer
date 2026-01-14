
import React from 'react';
import Widget from '../../Widget';
import { ChartBarIcon } from '../../icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
];

const MetricsWidget: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Widget title="Performance Metrics" className={className} icon={<ChartBarIcon className="w-4 h-4"/>}>
      <div className="w-full h-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.2)" />
            <XAxis dataKey="name" stroke="rgba(224, 242, 254, 0.7)" />
            <YAxis stroke="rgba(224, 242, 254, 0.7)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(2, 10, 26, 0.8)',
                borderColor: 'rgba(56, 189, 248, 0.5)',
                color: '#e0f2fe',
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Widget>
  );
};

export default MetricsWidget;
