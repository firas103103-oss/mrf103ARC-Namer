import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid } from 'recharts';

interface DataPoint {
  time: string;
  chaos: number;
  temp: number;
  spectral: number;
}

const LiveMonitor: React.FC<{ lang: 'en' | 'ar' }> = ({ lang }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  
  useEffect(() => {
    // Initial data generation
    const generateData = () => {
      const initial: DataPoint[] = [];
      for(let i=0; i<30; i++) {
        initial.push({
          time: i.toString(),
          chaos: 10 + Math.random() * 5,
          temp: 24 + Math.random() * 0.5,
          spectral: 5 + Math.random() * 10
        });
      }
      return initial;
    };
    
    setData(generateData());

    // Increased refresh rate: 800ms -> 500ms for "Live" feel
    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        // Simulate event: Ghost detection (EFII-22)
        // Probability of spike
        const isSpike = Math.random() > 0.97;
        
        const newChaos = isSpike 
          ? 85 + Math.random() * 15 // High Chaos
          : 10 + Math.random() * 10 + (Math.sin(parseInt(last.time)/5) * 5); // Normal fluctuation
          
        const newTemp = isSpike 
          ? 18 + Math.random() * 2 // Temp Drop (Cold Spot)
          : 24 + Math.random() * 0.5;

        const newSpectral = isSpike
          ? 90 + Math.random() * 10 // High Spectral Activity
          : 5 + Math.random() * 15;

        const newDataPoint = {
          time: (parseInt(last.time) + 1).toString(),
          chaos: newChaos,
          temp: newTemp,
          spectral: newSpectral
        };
        // Keep array size constant to prevent memory leak
        const newArray = [...prev, newDataPoint];
        if (newArray.length > 40) newArray.shift();
        return newArray;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Main Chart: Chaos vs Temp */}
      <div className="lg:col-span-2 p-4 bg-black/40 border border-xb-cyan/30 relative overflow-hidden rounded-sm group">
        <div className="absolute top-0 right-0 p-2 text-[10px] font-tech text-xb-cyan/60 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-xb-cyan animate-pulse"></span>
           {lang === 'en' ? 'LIVE SENSOR FEED :: DSS-99 SYNC' : 'بث المستشعر المباشر :: مزامنة DSS-99'}
        </div>
        
        <div className="flex gap-6 mb-4 mt-2 font-mono text-[10px] md:text-xs z-10 relative">
           <div className="flex items-center gap-2">
              <div className="w-2 h-0.5 bg-xb-red shadow-[0_0_5px_#ff0033]"></div>
              <span className="text-xb-red">{lang === 'en' ? 'CHAOS INDEX (Air Turbulence)' : 'مؤشر الفوضى (اضطراب الهواء)'}</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-0.5 bg-xb-cyan shadow-[0_0_5px_#00f3ff]"></div>
              <span className="text-xb-cyan">{lang === 'en' ? 'THERMAL (Celsius)' : 'الحرارة (مئوية)'}</span>
           </div>
        </div>

        <div className="h-[200px] md:h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorChaos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff0033" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ff0033" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', borderColor: '#333', fontSize: '12px' }}
                itemStyle={{ fontFamily: 'monospace' }}
                labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" dataKey="chaos" stroke="#ff0033" fillOpacity={1} fill="url(#colorChaos)" strokeWidth={1.5} animationDuration={300} />
              <Area type="monotone" dataKey="temp" stroke="#00f3ff" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={1.5} animationDuration={300} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart: Spectral Analysis */}
      <div className="lg:col-span-1 p-4 bg-black/40 border border-xb-gold/30 relative overflow-hidden rounded-sm">
        <div className="absolute top-0 right-0 p-2 text-[10px] font-tech text-xb-gold/60">
           {lang === 'en' ? 'SPECTRAL DENSITY' : 'الكثافة الطيفية'}
        </div>
        <div className="h-full flex flex-col justify-end pt-8">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(-15)}>
                    <Bar dataKey="spectral" fill="#ffd700" opacity={0.6} animationDuration={300}>
                        {
                          data.slice(-15).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.spectral > 80 ? '#ff0033' : '#ffd700'} />
                          ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
             <div className="text-center font-mono text-[10px] text-gray-500 mt-2">
                {lang === 'en' ? 'EMF/RF ACTIVITY' : 'نشاط المجال الكهرومغناطيسي'}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;