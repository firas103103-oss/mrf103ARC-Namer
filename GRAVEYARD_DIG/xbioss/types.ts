
export type Language = 'en' | 'ar';

export interface ContentData {
  title: string;
  subtitle: string;
  description: string;
}

export interface Patent {
  code: string;
  name: string;
  description: string;
  category: 'Structural' | 'Analytical' | 'Offensive' | 'Control';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  clearance: string;
  description: string;
  icon: string;
}

export interface TechSpec {
  label: string;
  value: string;
  detail: string;
  icon: string;
}

export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
}
