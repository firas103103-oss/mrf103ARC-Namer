/**
 * 📄 Pages Index - فهرس الصفحات
 * تصدير جميع صفحات ARC
 */

// Dashboard Pages
export { AgentDashboard } from './AgentDashboard';
export { IoTDashboard } from './IoTDashboard';
export { IntegrationDashboard } from './IntegrationDashboard';

// Re-export as default collection
export const dashboards = {
  AgentDashboard: () => import('./AgentDashboard'),
  IoTDashboard: () => import('./IoTDashboard'),
  IntegrationDashboard: () => import('./IntegrationDashboard'),
};
