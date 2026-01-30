import { ShoppingCart, Search, LayoutDashboard } from "lucide-react";

interface BottomNavProps {
  activeTab: "shop" | "track" | "admin";
  onTabChange: (tab: "shop" | "track" | "admin") => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "shop" as const, label: "Loja", icon: ShoppingCart },
    { id: "track" as const, label: "Pesquisa", icon: Search },
    { id: "admin" as const, label: "Admin", icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 pb-[env(safe-area-inset-bottom)]">
  <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
