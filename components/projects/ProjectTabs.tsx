"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface ProjectTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function ProjectTabs({
  tabs,
  activeTab,
  onTabChange,
}: ProjectTabsProps) {
  return (
    <Card className="bg-[#23232a] border-orange-500 shadow-lg">
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-1 p-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-700"
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <Badge
                  variant="outline"
                  className={`ml-1 ${
                    activeTab === tab.id
                      ? "border-white text-white"
                      : "border-neutral-500 text-neutral-400"
                  }`}
                >
                  {tab.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
