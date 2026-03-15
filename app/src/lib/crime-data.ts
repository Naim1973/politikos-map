export type CrimeType =
  | "assault"
  | "robbery"
  | "burglary"
  | "vandalism"
  | "theft"
  | "homicide"
  | "drug_offense"
  | "fraud"
  | "corruption";

export type PoliticalParty = "BNP" | "Jamaat" | "Awami League" | "Independent";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type WorkflowStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Crime {
  id: string;
  adminTag?: string;
  trackingCode?: string;
  type: CrimeType;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  severity: Severity;
  createdAt: Date;
  occurredAt?: Date;
  workflowStatus: WorkflowStatus;
  reporterName?: string;
  politicalParty?: PoliticalParty;
  suspectName?: string;
  otherPeople?: string;
  newsArticleUrl?: string;
  videoEvidenceUrl?: string;
  audioEvidenceUrl?: string;
  adminNote?: string;
  upazilaRelationId?: number;
  upazilaName?: string;
}

export function formatTimeAgo(date: Date | undefined | null): string {
  if (!date) return "Unknown";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const CRIME_TYPE_COLORS: Record<CrimeType, string> = {
  assault: "#ffffff",
  robbery: "#e0e0e0",
  burglary: "#c0c0c0",
  vandalism: "#a0a0a0",
  theft: "#808080",
  homicide: "#404040",
  drug_offense: "#606060",
  fraud: "#909090",
  corruption: "#ff4444",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  LOW: "#6b7280",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const STATUS_LABELS: Record<WorkflowStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const PARTY_COLORS: Record<PoliticalParty, string> = {
  "BNP": "#3b82f6",
  "Jamaat": "#22c55e",
  "Awami League": "#ef4444",
  "Independent": "#9ca3af",
};
