import type { Crime, CrimeType, Severity, WorkflowStatus, PoliticalParty } from "@/lib/crime-data";
import type { ServerReport } from "./types";

const VALID_CRIME_TYPES: Set<string> = new Set([
  "assault", "robbery", "burglary", "vandalism",
  "theft", "homicide", "drug_offense", "fraud", "corruption",
]);

const VALID_SEVERITIES: Set<string> = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const VALID_STATUSES: Set<string> = new Set(["PENDING", "APPROVED", "REJECTED"]);
const VALID_PARTIES: Set<string> = new Set(["BNP", "Jamaat", "Awami League", "Independent"]);

export function mapServerReport(raw: ServerReport): Crime {
  return {
    id: raw._id,
    trackingCode: raw.publicTrackingCode,
    type: VALID_CRIME_TYPES.has(raw.type) ? (raw.type as CrimeType) : "assault",
    title: raw.title,
    description: raw.description,
    location: raw.locationText || raw.upazilaNameSnapshot || "Unknown location",
    lat: raw.latitude ?? 23.8103,
    lng: raw.longitude ?? 90.4125,
    severity: VALID_SEVERITIES.has(raw.severity) ? (raw.severity as Severity) : "MEDIUM",
    createdAt: new Date(raw._creationTime),
    occurredAt: raw.occurredAt ? new Date(raw.occurredAt) : undefined,
    workflowStatus: VALID_STATUSES.has(raw.workflowStatus) ? (raw.workflowStatus as WorkflowStatus) : "PENDING",
    reporterName: raw.reporterName,
    politicalParty: raw.politicalParty && VALID_PARTIES.has(raw.politicalParty)
      ? (raw.politicalParty as PoliticalParty)
      : undefined,
    suspectName: raw.suspectName,
    adminTag: raw.adminTag,
    otherPeople: raw.otherPeople,
    newsArticleUrl: raw.newsArticleUrl,
    videoEvidenceUrl: raw.videoEvidenceUrl,
    audioEvidenceUrl: raw.audioEvidenceUrl,
    upazilaRelationId: raw.selectedUpazilaRelationId,
    upazilaName: raw.upazilaNameSnapshot,
  };
}
