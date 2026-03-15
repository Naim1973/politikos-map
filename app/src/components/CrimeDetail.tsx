"use client";

import { X, MapPin, Clock, User, AlertTriangle, Shield, Landmark, Link, Video, AudioLines, UserRound, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Crime } from "@/lib/crime-data";
import { formatTimeAgo, PARTY_COLORS, SEVERITY_LABELS, STATUS_LABELS } from "@/lib/crime-data";

interface CrimeDetailProps {
  crime: Crime | null;
  onClose: () => void;
}

export default function CrimeDetail({ crime, onClose }: CrimeDetailProps) {
  if (!crime) return null;

  const severityVariant = crime.severity;
  const statusVariant = crime.workflowStatus;

  const hasSource = (crime.newsArticleUrl || crime.videoEvidenceUrl || crime.audioEvidenceUrl);
  const hasPeople = (crime.suspectName || crime.otherPeople);

  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 z-20 w-72 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl max-h-[80vh] overflow-y-auto",
        "transition-all duration-300 ease-out",
        "animate-slide-up"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 p-1.5 rounded bg-white/10">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{crime.title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant={severityVariant}>{SEVERITY_LABELS[crime.severity]}</Badge>
              <Badge variant={statusVariant}>{STATUS_LABELS[crime.workflowStatus]}</Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 text-white/40 hover:text-white shrink-0 -mt-1 -mr-1"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Separator />

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-white/70 leading-relaxed">{crime.description}</p>

        <div className="space-y-2">
          <DetailRow icon={MapPin} label="Location" value={crime.location} />
          <DetailRow icon={Clock} label="Reported" value={formatTimeAgo(crime.createdAt)} />
          <DetailRow icon={User} label="Officer" value={crime.reporterName ?? "Anonymous"} />
          {crime.type === "corruption" && crime.politicalParty && (
            <div className="flex items-center gap-2">
              <Landmark className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs text-white/30 mr-1.5">Party:</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: PARTY_COLORS[crime.politicalParty] }}
                >
                  {crime.politicalParty}
                </span>
              </div>
            </div>
          )}
          <DetailRow
            icon={Shield}
            label="ID"
            value={crime.id.toUpperCase()}
            mono
          />
        </div>

        {/* Sources & Evidence */}
        {hasSource && (
          <>
            <Separator className="bg-white/10" />
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Sources & Evidence</span>
              <div className="space-y-1.5">
                {crime.newsArticleUrl && (
                  <SourceLink icon={Link} label="News Article" url={crime.newsArticleUrl} />
                )}
                {crime.videoEvidenceUrl && (
                  <SourceLink icon={Video} label="Video Evidence" url={crime.videoEvidenceUrl} />
                )}
                {crime.audioEvidenceUrl && (
                  <SourceLink icon={AudioLines} label="Audio Evidence" url={crime.audioEvidenceUrl} />
                )}
              </div>
            </div>
          </>
        )}

        {/* People Involved */}
        {hasPeople && (
          <>
            <Separator className="bg-white/10" />
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">People Involved</span>
              <div className="space-y-2">
                {crime.suspectName && (
                  <DetailRow icon={UserRound} label="Suspect" value={crime.suspectName} />
                )}
                {crime.otherPeople && (
                  <DetailRow icon={Users} label="Others" value={crime.otherPeople} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-white/30 shrink-0" />
      <div className="min-w-0">
        <span className="text-xs text-white/30 mr-1.5">{label}:</span>
        <span className={cn("text-xs text-white/80", mono && "font-mono")}>{value}</span>
      </div>
    </div>
  );
}

function SourceLink({
  icon: Icon,
  label,
  url,
}: {
  icon: React.ElementType;
  label: string;
  url: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
      <div className="min-w-0 truncate">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors truncate"
          title={label}
        >
          {label}
        </a>
      </div>
    </div>
  );
}
