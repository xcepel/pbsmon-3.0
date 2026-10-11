import type { ReactNode } from "react";
import { Tabs as DsTabs } from "@metacentrum/design-system";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div>
      {/* Content renders below so inactive tabs stay unmounted */}
      <DsTabs
        tabs={tabs.map(({ id, label }) => ({ id, label }))}
        selected={activeTab}
        onChange={onTabChange}
      />

      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
