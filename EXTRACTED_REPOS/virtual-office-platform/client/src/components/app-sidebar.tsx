import { Cpu } from "lucide-react";

export function AppSidebar() {
  return (
    <div className="flex h-full flex-col bg-gray-900 text-white p-4">
      <div className="flex items-center gap-2 mb-6">
        <Cpu className="h-6 w-6" />
        <span className="font-bold text-lg">Virtual Office</span>
      </div>
      <div className="flex-1">
        <nav className="space-y-2">
          <div className="px-3 py-2 bg-gray-800 rounded-md">
            <span className="text-sm">Digital Twin Creation</span>
          </div>
        </nav>
      </div>
    </div>
  );
}
