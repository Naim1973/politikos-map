"use client";

import { Shield, Flag, BarChart3, ArrowLeft, Globe, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminView = "reports" | "all_data" | "blocked_ips" | "activity";

interface AdminSidebarProps {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  stats: {
    total: number;
    pending: number;
    actioned: number;
    dismissed: number;
  };
  userName?: string;
}

export default function AdminSidebar({ activeView, onViewChange, stats, userName }: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex w-72 h-full border-r border-white/10 flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
        <span className="font-bold text-white text-sm tracking-wider uppercase">Crime Map-Bangladesh</span>
      </div>

      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-white/10">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider">Admin Panel</p>
            <p className="text-[10px] text-white/40">Moderation Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total" value={stats.total} highlight={false} />
          <StatCard label="Pending" value={stats.pending} highlight={stats.pending > 0} />
          <StatCard label="Actioned" value={stats.actioned} highlight={false} />
          <StatCard label="Dismissed" value={stats.dismissed} highlight={false} />
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 shrink-0 space-y-1">
        <NavButton
          active={activeView === "reports"}
          onClick={() => onViewChange("reports")}
          icon={Flag}
          label="Flagged Reports"
          badge={stats.pending > 0}
        />
        <NavButton
          active={activeView === "all_data"}
          onClick={() => onViewChange("all_data")}
          icon={BarChart3}
          label="All Incidents"
        />
        <NavButton
          active={activeView === "blocked_ips"}
          onClick={() => onViewChange("blocked_ips")}
          icon={Globe}
          label="Blocked IPs"
        />
        <NavButton
          active={activeView === "activity"}
          onClick={() => onViewChange("activity")}
          icon={ScrollText}
          label="Activity Log"
        />
      </div>

      <div className="flex-1" />

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 shrink-0 space-y-1">
        <a
          href="/"
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Map
        </a>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs text-white/40">Signed in as</span>
          <span className="text-xs font-semibold text-white">{userName || "admin"}</span>
        </div>
      </div>
    </aside>
  );
}


function StatCard({ label, value, highlight }: { label: string; value: number; highlight: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md p-2.5 border transition-all duration-300",
        highlight ? "bg-white/5 border-white/20" : "bg-transparent border-white/10"
      )}
    >
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
      <p
        className={cn(
          "text-lg font-bold font-mono tabular-nums transition-all duration-300",
          highlight ? "text-white" : "text-white/70"
        )}
      >
        {value.toString().padStart(2, "0")}
      </p>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  badge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs transition-all duration-200",
        active
          ? "bg-white/10 text-white border border-white/20"
          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {badge && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
    </button>
  );
}
