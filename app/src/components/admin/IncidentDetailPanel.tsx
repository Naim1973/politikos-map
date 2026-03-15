"use client";

import {
  X, MapPin, Clock, User, AlertTriangle, Shield, Landmark,
  Link as LinkIcon, Video, AudioLines, Users, Pencil, Trash2,
  CheckCircle2, Ban, Globe, Tag, Flag, Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatTimeAgo, PARTY_COLORS, SEVERITY_LABELS, STATUS_LABELS } from "@/lib/crime-data";
import type { Crime } from "@/lib/crime-data";
import { useState, useRef } from "react";
import {
  ADMIN_TAG_LABELS,
  TAG_STATUS_CONFIG,
  type FlaggedIncident,
  type AdminTag,
} from "@/lib/admin-data";

interface IncidentDetailPanelProps {
  crime: Crime;
  flag?: FlaggedIncident | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTagChange: (tag: AdminTag) => void;
  onBlockIP: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onUndoApprove?: () => void;
  onSaveNote?: (note: string) => void;
  onUndoReject?: () => void;
}

const ALL_TAGS: AdminTag[] = ["verified", "fake", "under_review", "inaccurate", "duplicate", "sensitive"];

export default function IncidentDetailPanel({
  crime,
  flag,
  onClose,
  onEdit,
  onDelete,
  onTagChange,
  onBlockIP,
  onApprove,
  onReject,
  onUndoApprove,
  onSaveNote,
  onUndoReject,
}: IncidentDetailPanelProps) {
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const severityVariant = crime.severity;
  const statusVariant = crime.workflowStatus;

  const hasSource = (crime.newsArticleUrl || crime.videoEvidenceUrl || crime.audioEvidenceUrl);
  const hasPeople = (crime.suspectName || crime.otherPeople);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-black border-l border-white/10 flex flex-col transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider">Incident Details</span>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-white/40 hover:text-white shrink-0">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* flag Info if viewing from reports */}
            {flag && (
              <>
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Admin Flag</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary">
                      {(() => { const I = TAG_STATUS_CONFIG[flag.tag].icon; return <I className="w-2.5 h-2.5 mr-1" />; })()}
                      {ADMIN_TAG_LABELS[flag.tag]}
                    </Badge>
                    {flag.ipBlocked && (
                      <Badge variant="secondary">
                        <Globe className="w-2.5 h-2.5 mr-1" />
                        IP Blocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{flag.adminNote}</p>
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <Globe className="w-3 h-3" />
                    <span>Submitter IP: <strong className="text-white/50 font-mono">{flag.submitterIP}</strong></span>
                    <span>·</span>
                    <span>{formatTimeAgo(flag.flaggedAt)}</span>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Crime Details */}
            <div className="space-y-3">
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
              {flag && (
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {ADMIN_TAG_LABELS[flag.tag]}
                  </Badge>
                </div>
              )}
              <p className="text-xs text-white/70 leading-relaxed">{crime.description}</p>

              <div className="space-y-2">
                <DetailRow icon={MapPin} label="Location" value={crime.location} />
                <DetailRow icon={Clock} label="Reported" value={crime.reportedAt ? formatTimeAgo(crime.reportedAt) : "Unknown"} />
                <DetailRow icon={User} label="Officer" value={crime.reporterName ?? "Anonymous"} />
                {crime.type === "corruption" && crime.politicalParty && (
                  <div className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs text-white/30 mr-1.5">Party:</span>
                      <span className="text-xs font-semibold" style={{ color: PARTY_COLORS[crime.politicalParty] }}>
                        {crime.politicalParty}
                      </span>
                    </div>
                  </div>
                )}
                <DetailRow icon={Shield} label="ID" value={crime.id.toUpperCase()} mono />
              </div>

              {/* Sources */}
              {hasSource && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Sources & Evidence</span>
                    <div className="space-y-1.5">
                      {crime.newsArticleUrl && <SourceLink icon={LinkIcon} label="News Article" url={crime.newsArticleUrl} />}
                      {crime.videoEvidenceUrl && <SourceLink icon={Video} label="Video Evidence" url={crime.videoEvidenceUrl} />}
                      {crime.audioEvidenceUrl && <SourceLink icon={AudioLines} label="Audio Evidence" url={crime.audioEvidenceUrl} />}
                    </div>
                  </div>
                </>
              )}

              {/* People */}
              {hasPeople && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">People Involved</span>
                    <div className="space-y-2">
                      {crime.suspectName && <DetailRow icon={User} label="Suspect" value={crime.suspectName} />}
                      {crime.otherPeople && <DetailRow icon={Users} label="Others" value={crime.otherPeople} />}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Tag Assignment */}
            <div className="space-y-2">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                <Tag className="w-3 h-3 inline mr-1 -mt-0.5" />
                Assign Tag
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagChange(tag)}
                    className={cn(
                      "px-2 py-1 rounded text-xs border transition-all duration-150 capitalize",
                      flag?.tag === tag
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                    )}
                  >
                    {ADMIN_TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
            </div>

            {/* admin Note */}
            <div className="space-y-2">
  <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium block">Admin Note</label>
  <textarea
    ref={noteRef}
    placeholder="Add a note about this incident..."
    defaultValue={flag?.adminNote || crime.adminNote || ""}
    rows={2}
    className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors resize-none"
  />
  <button
    onClick={() => onSaveNote?.(noteRef.current?.value || "")}
    className="text-xs text-white/50 hover:text-white border border-white/20 hover:border-white/40 rounded px-2 py-1 transition-colors"
  >
    Save Note
  </button>
</div>

            <Separator />

            {/* actions */}
            <div className="space-y-2">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Actions</span>
              <div className="grid grid-cols-2 gap-2">
                {crime.workflowStatus === "APPROVED" ? (
  <Button variant="outline" size="sm" className="text-xs gap-1.5 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10" onClick={onUndoApprove}>
    <Undo2 className="w-3 h-3" />
    Undo Approval
  </Button>
) : (
  <Button variant="outline" size="sm" className="text-xs gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={onApprove}>
    <CheckCircle2 className="w-3 h-3" />
    Approve
  </Button>
)}
                {crime.workflowStatus === "REJECTED" ? (
  <Button variant="outline" size="sm" className="text-xs gap-1.5 text-blue-400 border-blue-500/30 hover:bg-blue-500/10" onClick={onUndoReject}>
    <Undo2 className="w-3 h-3" />
    Undo Rejection
  </Button>
) : (
  <Button variant="outline" size="sm" className="text-xs gap-1.5 text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={onReject}>
    <Ban className="w-3 h-3" />
    Reject
  </Button>
)}
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={onEdit}>
                  <Pencil className="w-3 h-3" />
                  Edit Data
                </Button>
                <Button variant="destructive" size="sm" className="text-xs gap-1.5" onClick={onDelete}>
                  <Trash2 className="w-3 h-3" />
                  Remove
                </Button>
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-white/50" onClick={onBlockIP}>
                  <Globe className="w-3 h-3" />
                  {flag?.ipBlocked ? "Unblock IP" : "Block IP"}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-white/50">
                  <Flag className="w-3 h-3" />
                  Escalate
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}


function DetailRow({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: string; mono?: boolean }) {
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

function SourceLink({ icon: Icon, label, url }: { icon: React.ElementType; label: string; url: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
      <div className="min-w-0 truncate">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors truncate" title={label}>
          {label}
        </a>
      </div>
    </div>
  );
}
