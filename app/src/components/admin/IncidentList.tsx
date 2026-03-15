"use client";

import type { FlaggedIncident } from "@/lib/admin-data";
import { ADMIN_TAG_LABELS } from "@/lib/admin-data";
import { useState, useMemo } from "react";
import { Search, X, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Crime } from "@/lib/crime-data";
import { SEVERITY_LABELS, STATUS_LABELS } from "@/lib/crime-data";
import { CRIME_TYPE_ICONS } from "@/lib/admin-data";

interface IncidentListProps {
  crimes: Crime[];
  flags: FlaggedIncident[];
  onSelect: (crime: Crime) => void;
  onEdit: (crime: Crime) => void;
  onDelete: (crime: Crime) => void;
  selectedId: string | null;
}

export default function IncidentList({ crimes, flags, onSelect, onEdit, onDelete, selectedId }: IncidentListProps) { 
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    if (!search) return crimes;
    return crimes.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [crimes, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
        <Input
          placeholder="Search incidents..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-8 h-8 text-xs"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <p className="text-xs text-white/40">
        {filtered.length} incident{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-1">
        {paginated.map((crime) => {
          const TypeIcon = CRIME_TYPE_ICONS[crime.type];
          const severityVariant = crime.severity;
          const statusVariant = crime.workflowStatus;

          return (
            <div
              key={crime.id}
              className={cn(
                "flex items-start gap-2.5 rounded-md px-3 py-2.5 border transition-all duration-200 group cursor-pointer",
                selectedId === crime.id
                  ? "bg-white/10 border-white/30"
                  : "border-transparent hover:bg-white/5 hover:border-white/10"
              )}
              onClick={() => onSelect(crime)}
            >
              <div className="mt-0.5 p-1 rounded shrink-0 bg-white/10">
                <TypeIcon className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-white truncate">{crime.title}</span>
                  <span className="text-[10px] text-white/30 font-mono shrink-0">{crime.id.replace("crime-", "#")}</span>
                </div>
                <p className="text-xs text-white/50 truncate">{crime.location}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={severityVariant} className="text-[10px] px-1.5 py-0">{SEVERITY_LABELS[crime.severity]}</Badge>
                    <Badge variant={statusVariant} className="text-[10px] px-1.5 py-0">{STATUS_LABELS[crime.workflowStatus]}</Badge>
                    {(() => { const f = flags.find(f => f.crimeId === crime.id); return f ? <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{ADMIN_TAG_LABELS[f.tag]}</Badge> : null; })()}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(crime); }}
                      className="p-1 rounded text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(crime); }}
                      className="p-1 rounded text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-white/30">
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-7 w-7">
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn("w-7 h-7 rounded-md text-xs font-medium transition-all duration-200", p === page ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/10")}>
                {p}
              </button>
            ))}
            <Button variant="ghost" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-7 w-7">
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
