"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  AlertCircle,
  Shield,
  Car,
  Package,
  Flame,
  Pill,
  CreditCard,
  Hammer,
  Landmark,
  Info,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Crime, CrimeType, Severity, WorkflowStatus } from "@/lib/crime-data";
import { formatTimeAgo, PARTY_COLORS, SEVERITY_LABELS, STATUS_LABELS } from "@/lib/crime-data";
import { useRouter } from "next/navigation";

const CRIME_ICONS: Record<CrimeType, React.ElementType> = {
  assault: Flame,
  robbery: Shield,
  burglary: Package,
  vandalism: Hammer,
  theft: Car,
  homicide: AlertCircle,
  drug_offense: Pill,
  fraud: CreditCard,
  corruption: Landmark,
};

interface SidebarProps {
  crimes: Crime[];
  selectedCrime: Crime | null;
  onCrimeSelect: (crime: Crime) => void;
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    critical: number;
  };
    onFilteredCrimesChange?: (crimes: Crime[]) => void;
    onAboutClick?: () => void;
}



const ALL_TYPES: CrimeType[] = [
  "assault",
  "robbery",
  "burglary",
  "vandalism",
  "theft",
  "homicide",
  "drug_offense",
  "fraud",
  "corruption",
];

const SEVERITY_ORDER: Record<Crime["severity"], number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};


type TimeFilter = "1h" | "24h" | "7d" | "30d" | "all";

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "1 Hour", value: "1h" },
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

function getTimeCutoff(filter: TimeFilter): Date | null {
  if (filter === "all") return null;
  const now = new Date();
  switch (filter) {
    case "1h":
      return new Date(now.getTime() - 1 * 60 * 60 * 1000);
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}


export default function Sidebar({
  crimes,
  selectedCrime,
  onCrimeSelect,
  isOpen,
  onClose,
  stats,
  onFilteredCrimesChange,
  onAboutClick,

}: SidebarProps) {

  const [selectedTime, setSelectedTime] = useState<TimeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<CrimeType[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<WorkflowStatus | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const toggleType = (type: CrimeType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedSeverity(null);
    setSelectedStatus(null);
    setSelectedTime("all"); 
  };

  const hasFilters =
    searchQuery ||
    selectedTypes.length > 0 ||
    selectedSeverity ||
    selectedStatus ||
    selectedTime !== "all"; 


  const filteredCrimes = useMemo(() => {
    const timeCutoff = getTimeCutoff(selectedTime);

    return crimes
      .filter((crime) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (
            !crime.title.toLowerCase().includes(q) &&
            !crime.location.toLowerCase().includes(q) &&
            !crime.description.toLowerCase().includes(q) &&
            !crime.type.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        if (selectedTypes.length > 0 && !selectedTypes.includes(crime.type)) return false;
        if (selectedSeverity && crime.severity !== selectedSeverity) return false;
        if (selectedStatus && crime.workflowStatus !== selectedStatus) return false;

        if (timeCutoff) {
          const crimeDate = new Date(crime.createdAt);
          if (crimeDate < timeCutoff) return false;
        }

        return true;
      })
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [crimes, searchQuery, selectedTypes, selectedSeverity, selectedStatus, selectedTime]);

  useEffect(() => {
    onFilteredCrimesChange?.(filteredCrimes);
  }, [filteredCrimes, onFilteredCrimesChange]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-full w-72 bg-black border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm tracking-wider uppercase">
            Crime Map-Bangladesh
          </span>
        </div>
        
        <button
          onClick={onClose}
          className="lg:hidden text-white/50 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total" value={stats.total} highlight={false} />
          <StatCard label="Approved" value={stats.approved} highlight={true} />
          <StatCard label="Pending" value={stats.pending} highlight={false} />
          <StatCard label="Critical" value={stats.critical} highlight={stats.critical > 0} />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <Input
            placeholder="Search crimes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5 text-white/60 hover:text-white px-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3 h-3" />
            Filters
            {hasFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            )}
          </Button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="px-4 py-2 border-b border-white/10 shrink-0 overflow-y-auto max-h-64">
          <div className="space-y-2">
            <div>
              <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Type</p>
              <div className="flex flex-wrap gap-1">
                {ALL_TYPES.map((type) => {
                  const Icon = CRIME_ICONS[type];
                  const isActive = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all duration-150",
                        isActive
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                      )}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {type.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Time Range</p>
              <div className="flex flex-wrap gap-1">
                {TIME_FILTERS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTime(t.value)}
                    className={cn(
                      "px-2 py-1 rounded text-xs border transition-all duration-150",
                      selectedTime === t.value
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Severity</p>
              <div className="flex gap-1">
                {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as Severity[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeverity(selectedSeverity === s ? null : s)}
                    className={cn(
                      "px-2 py-1 rounded text-xs border transition-all duration-150",
                      selectedSeverity === s
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                    )}
                  >
                    {SEVERITY_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Status</p>
              <div className="flex gap-1">
                {(["PENDING", "APPROVED", "REJECTED"] as WorkflowStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
                    className={cn(
                      "px-2 py-1 rounded text-xs border transition-all duration-150",
                      selectedStatus === s
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                    )}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="px-4 py-2 shrink-0">
        <p className="text-xs text-white/40">
          {filteredCrimes.length} incident{filteredCrimes.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Crime List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {filteredCrimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/30">
              <Search className="w-8 h-8 mb-2" />
              <p className="text-sm">No incidents found</p>
            </div>
          ) : (
            filteredCrimes.map((crime) => (
              <CrimeListItem
                key={crime.id}
                crime={crime}
                isSelected={selectedCrime?.id === crime.id}
                onClick={() => onCrimeSelect(crime)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="px-4 py-3 border-t border-white/10 shrink-0 space-y-1">
        <button
  onClick={onAboutClick}
  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
>
  <Info className="w-3.5 h-3.5" />
  About
</button>
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors" onClick={() => router.push("/admin")} >
          <ShieldCheck className="w-3.5 h-3.5" />
          Moderator Panel
        </button>
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          Social Media
        </button>
      </div>
    </aside>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md p-2.5 border transition-all duration-300",
        highlight
          ? "bg-white/5 border-white/20"
          : "bg-transparent border-white/10"
      )}
    >
      <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
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

function CrimeListItem({
  crime,
  isSelected,
  onClick,
}: {
  crime: Crime;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = CRIME_ICONS[crime.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-md px-3 py-2.5 border transition-all duration-200 group",
        isSelected
          ? "bg-white/10 border-white/30"
          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "mt-0.5 p-1 rounded shrink-0 transition-all duration-200",
            crime.severity === "CRITICAL" ? "bg-white/20" : "bg-white/10"
          )}
        >
          <Icon className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-xs font-semibold text-white truncate">{crime.title}</span>
            <StatusDot status={crime.workflowStatus} />
          </div>
          <p className="text-xs text-white/50 truncate">{crime.location}</p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <Badge
                variant={crime.severity}
                className="text-xs px-1.5 py-0"
              >
                {SEVERITY_LABELS[crime.severity]}
              </Badge>
              <Badge
                variant={crime.workflowStatus}
                className="text-xs px-1.5 py-0"
              >
                {STATUS_LABELS[crime.workflowStatus]}
              </Badge>
              {crime.type === "corruption" && crime.politicalParty && (
                <span
                  className="text-xs px-1.5 py-0 rounded border font-medium"
                  style={{
                    color: PARTY_COLORS[crime.politicalParty],
                    borderColor: PARTY_COLORS[crime.politicalParty] + "40",
                  }}
                >
                  {crime.politicalParty}
                </span>
              )}
            </div>
            <span className="text-xs text-white/30">{formatTimeAgo(crime.createdAt)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function StatusDot({ status }: { status: Crime["workflowStatus"] }) {
  return (
    <span
      className={cn(
        "inline-block w-1.5 h-1.5 rounded-full shrink-0",
        status === "APPROVED" && "bg-white animate-pulse",
        status === "PENDING" && "bg-white/60",
        status === "REJECTED" && "bg-white/20"
      )}
    />
  );
}
