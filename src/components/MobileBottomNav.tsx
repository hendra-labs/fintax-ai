import React from "react";
import { 
  LayoutDashboard, 
  Landmark, 
  BookOpen, 
  FileCheck, 
  Bot,
  Sparkles
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "banking", label: "Banking", icon: Landmark },
    { id: "accounting", label: "Ledger", icon: BookOpen },
    { id: "tax", label: "Tax RAG", icon: FileCheck },
    { id: "cfo", label: "AI CFO", icon: Bot, isHighlighted: true },
    { id: "showcase", label: "Public SEO", icon: Sparkles },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 flex items-center justify-around safe-area-pb shadow-2xl shadow-black/80"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`min-h-[44px] min-w-[44px] flex-1 py-1 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all relative rounded-xl ${
              isActive
                ? "text-emerald-400 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {item.isHighlighted ? (
              <div className={`p-1 rounded-lg ${isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-500/10 text-emerald-400"}`}>
                <Icon className="w-4 h-4" />
              </div>
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span className="truncate max-w-[56px] tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute bottom-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
