import { get, post, patch } from "./client";
import type {
  ApprovedReportsResponse,
  SubmitReportRequest,
  SubmitReportResponse,
  ReportStatusResponse,
} from "./types";

export interface PendingReport {
  reportId: string;
  status: string;
  submittedAt: string;
  adminTag?: string;
  title: string;
  type: string;
  severity?: string;
  latitude?: number;
  longitude?: number;
  locationText?: string;
  description?: string;
  suspectName?: string;
  otherPeople?: string;
  newsArticleUrl?: string;
  videoEvidenceUrl?: string;
  audioEvidenceUrl?: string;
  politicalParty?: string;
  upazila: { relationId?: number; nameSnapshot?: string };
}

export interface PendingReportsResponse {
  data: PendingReport[];
  meta: { page: number; pageSize: number; total: number };
}

export function fetchApprovedReports() {
  return get<ApprovedReportsResponse>("/v1/reports/approved");
}

export function fetchPendingReports() {
  return get<PendingReportsResponse>("/v1/reports/pending");
}

export function fetchRejectedReports() {
  return get<PendingReportsResponse>("/v1/reports/rejected");
}

export function approveReport(reportId: string) {
  return patch<void>(`/v1/reports/${reportId}/approve`, {});
}

export function rejectReport(reportId: string) {
  return patch<void>(`/v1/reports/${reportId}/reject`, {});
}

export function submitReport(data: SubmitReportRequest) {
  return post<SubmitReportResponse>("/v1/reports", data);
}

export function getReportStatus(trackingCode: string) {
  return get<ReportStatusResponse>(`/v1/reports/status/${trackingCode}`);
}

export function deleteReport(reportId: string) {
  return post<void>(`/v1/reports/${reportId}/delete`);
}

export function updateReport(reportId: string, data: Record<string, any>) {
  return patch<void>(`/v1/reports/${reportId}`, data);
}

export function setPendingReport(reportId: string) {
  return patch<void>(`/v1/reports/${reportId}/pending`, {});
}

export function setReportTag(reportId: string, tag: string | null) {
  return patch<void>(`/v1/reports/${reportId}/tag`, { tag });
}

export function fetchActivityLog() {
  return get<Array<{
    id: string;
    action: string;
    target: string;
    detail: string;
    timestamp: string;
  }>>("/v1/reports/activity");
}

export function logActivityEntry(action: string, target: string, detail: string) {
  return post<void>("/v1/reports/activity", { action, target, detail });
}