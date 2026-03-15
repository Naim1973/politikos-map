export interface ServerReport {
  _id: string;
  _creationTime: number;
  publicTrackingCode?: string;
  type: string;
  adminTag?: string;
  title: string;
  description: string;
  locationText?: string;
  selectedUpazilaRelationId?: number;
  upazilaNameSnapshot?: string;
  latitude?: number;
  longitude?: number;
  severity: string;
  occurredAt?: number;
  workflowStatus: string;
  reporterName?: string;
  politicalParty?: string;
  suspectName?: string;
  otherPeople?: string;
  newsArticleUrl?: string;
  videoEvidenceUrl?: string;
  audioEvidenceUrl?: string;
}

export interface SubmitReportRequest {
  category: string;
  title: string;
  description: string;
  location?: {
    addressText: string;
    lat?: number;
    lng?: number;
  };
  upazila?: {
    relationId?: number;
    nameSnapshot?: string;
  };
  severity: string;
  occurredAt?: string;
  contact?: {
    name?: string;
  };
  politicalParty?: string;
  suspectName?: string;
  otherPeople?: string;
  newsArticleUrl?: string;
  videoEvidenceUrl?: string;
  audioEvidenceUrl?: string;
}

export interface SubmitReportResponse {
  data: {
    trackingCode: string;
  };
}

export interface ApprovedReportsResponse {
  data: ServerReport[];
}

export interface ReportStatusResponse {
  data: {
    workflowStatus: string;
    title: string;
    publicTrackingCode: string;
  };
}
