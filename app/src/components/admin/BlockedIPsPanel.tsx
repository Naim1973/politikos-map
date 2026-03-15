"use client";

import { useState } from "react";
import { Globe, Trash2, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatTimeAgo } from "@/lib/crime-data";
import type { BlockedIP } from "@/lib/admin-data";

interface BlockedIPsPanelProps {
  blockedIPs: BlockedIP[];
}

export default function BlockedIPsPanel({ blockedIPs }: BlockedIPsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40">{blockedIPs.length} blocked IP{blockedIPs.length !== 1 ? "s" : ""}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-3 h-3" />
          Block New IP
        </Button>
      </div>

      {/* Add IP Form */}
      {showAddForm && (
        <div className="border border-white/10 rounded-md p-4 space-y-3 animate-slide-up">
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Block a new IP address</span>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">IP Address</label>
            <input
              type="text"
              placeholder="e.g. 192.168.1.100"
              className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-xs text-white font-mono placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">Reason</label>
            <textarea
              placeholder="Why is this IP being blocked..."
              rows={2}
              className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-white/50" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button size="sm" className="text-xs font-semibold uppercase tracking-wider gap-1.5">
              <Shield className="w-3 h-3" />
              Block IP
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* IP List */}
      <div className="space-y-1">
        {blockedIPs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/30">
            <Globe className="w-8 h-8 mb-2" />
            <p className="text-sm">No blocked IPs</p>
          </div>
        ) : (
          blockedIPs.map((entry) => (
            <div
              key={entry.ip}
              className="flex items-start gap-2.5 rounded-md px-3 py-2.5 border border-transparent hover:bg-white/5 hover:border-white/10 transition-all duration-200 group"
            >
              <div className="mt-0.5 p-1 rounded shrink-0 bg-white/10">
                <Globe className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-white font-mono">{entry.ip}</span>
                  <span className="text-[10px] text-white/30">{formatTimeAgo(entry.blockedAt)}</span>
                </div>
                <p className="text-xs text-white/50 truncate">{entry.reason}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-white/30">{entry.incidentCount} incident{entry.incidentCount !== 1 ? "s" : ""} from this IP</span>
                  <button
                    className="p-1 rounded text-white/30 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Unblock"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
