"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/crime-data";
import type { Crime } from "@/lib/crime-data";
import {
  CRIME_TYPE_ICONS,
  TAG_STATUS_CONFIG,
  ADMIN_TAG_LABELS,
  type FlaggedIncident,
  type AdminTag,
} from "@/lib/admin-data";

interface ReportListProps {
  flags: FlaggedIncident[];
  crimes: Crime[];
  onSelect: (flag: FlaggedIncident) => void;
  selectedId: string | null;
}

const TAG_OPTIONS: { value: AdminTag | "all"; label: string }[] = [
  { value: "all", label: "All Tags" },
  { value: "under_review", label: "Under Review" },
  { value: "verified", label: "Verified" },
  { value: "fake", label: "Fake" },
  { value: "inaccurate", label: "Inaccurate" },
  { value: "duplicate", label: "Duplicate" },
  { value: "sensitive", label: "Sensitive" },
];

export default function ReportList({ flags, crimes, onSelect, selectedId }: ReportListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<AdminTag | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const getCrime = (crimeId: string) => crimes.find((c) => c.id === crimeId);

  const filtered = useMemo(() => {
    return flags.filter((f) => {
      const crime = getCrime(f.crimeId);
      const matchesSearch =
        !searchQuery ||
        crime?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crime?.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.adminNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.submitterIP.includes(searchQuery);
      const matchesTag = tagFilter === "all" || f.tag === tagFilter;
      return matchesSearch && matchesTag;
    });
  }, [flags, searchQuery, tagFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <Input
            placeholder="Search by title, location, IP..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-8 h-8 text-xs"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-white/30" />
          <select
            value={tagFilter}
            onChange={(e) => { setTagFilter(e.target.value as AdminTag | "all"); setCurrentPage(1); }}
            className="appearance-none bg-white/5 border border-white/20 rounded-md px-3 py-1.5 pr-7 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors cursor-pointer"
          >
            {TAG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-black text-white">{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-white/40">
        {filtered.length} flagged report{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      <div className="space-y-1">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/30">
            <Search className="w-8 h-8 mb-2" />
            <p className="text-sm">No flagged reports found</p>
          </div>
        ) : (
          paginated.map((flag) => {
            const crime = getCrime(flag.crimeId);
            if (!crime) return null;
            const TypeIcon = CRIME_TYPE_ICONS[crime.type];
            const tagCfg = TAG_STATUS_CONFIG[flag.tag];
            const TagIcon = tagCfg.icon;

            return (
              <button
                key={flag.id}
                onClick={() => onSelect(flag)}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2.5 border transition-all duration-200 group",
                  selectedId === flag.id
                    ? "bg-white/10 border-white/30"
                    : "border-transparent hover:bg-white/5 hover:border-white/10"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded shrink-0 bg-white/10">
                    <TypeIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-white truncate">{crime.title}</span>
                      <span className={cn(
                        "inline-block w-1.5 h-1.5 rounded-full shrink-0",
                        flag.tag === "under_review" && "bg-white animate-pulse",
                        flag.tag === "verified" && "bg-white/40",
                        flag.tag === "fake" && "bg-white/20",
                        (flag.tag === "inaccurate" || flag.tag === "duplicate" || flag.tag === "sensitive") && "bg-white/60",
                      )} />
                    </div>
                    <p className="text-xs text-white/50 truncate">{crime.location}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          <TagIcon className="w-2.5 h-2.5 mr-0.5" />
                          {ADMIN_TAG_LABELS[flag.tag]}
                        </Badge>
                        {flag.ipBlocked && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            IP Blocked
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-white/30">{formatTimeAgo(flag.flaggedAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-white/30">
            {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 w-7">
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-7 h-7 rounded-md text-xs font-medium transition-all duration-200", page === currentPage ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/10")}>
                {page}
              </button>
            ))}
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 w-7">
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
