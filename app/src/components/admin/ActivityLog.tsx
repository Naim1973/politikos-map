"use client";

import { Tag, Pencil, Trash2, Globe, CheckCircle2, Undo2, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/crime-data";
import type { ActivityEntry } from "@/lib/admin-data";

interface ActivityLogProps {
  entries: ActivityEntry[];
}

const ACTION_CONFIG: Record<ActivityEntry["action"], { icon: React.ElementType; label: string }> = {
  tagged: { icon: Tag, label: "Tagged" },
  edited: { icon: Pencil, label: "Edited" },
  deleted: { icon: Trash2, label: "Deleted" },
  blocked_ip: { icon: Globe, label: "Blocked IP" },
  unblocked_ip: { icon: Globe, label: "Unblocked IP" },
  verified: { icon: CheckCircle2, label: "Verified" },
  restored: { icon: Undo2, label: "Restored" },
};

export default function ActivityLog({ entries }: ActivityLogProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-white/40">{entries.length} recent action{entries.length !== 1 ? "s" : ""}</p>

      <div className="space-y-1">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/30">
            <ScrollText className="w-8 h-8 mb-2" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          entries.map((entry) => {
            const cfg = ACTION_CONFIG[entry.action];
            const Icon = cfg.icon;

            return (
              <div
                key={entry.id}
                className="flex items-start gap-2.5 rounded-md px-3 py-2.5 border border-transparent hover:bg-white/5 hover:border-white/10 transition-all duration-200"
              >
                <div className="mt-0.5 p-1 rounded shrink-0 bg-white/10">
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                        {cfg.label}
                      </Badge>
                      <span className="text-xs font-semibold text-white font-mono truncate">
                        {entry.target}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 shrink-0">{formatTimeAgo(entry.timestamp)}</span>
                  </div>
                  <p className="text-xs text-white/50 truncate">{entry.detail}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
