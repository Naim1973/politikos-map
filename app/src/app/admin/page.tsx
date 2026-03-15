"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shield, Flag, BarChart3, Globe, ScrollText, ArrowLeft, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Crime } from "@/lib/crime-data";
import {
  MOCK_BLOCKED_IPS,
  MOCK_ACTIVITY,
  type FlaggedIncident,
  type AdminTag,
} from "@/lib/admin-data";
import { fetchApprovedReports, fetchPendingReports, fetchRejectedReports, approveReport, rejectReport, deleteReport, updateReport, setPendingReport, setReportTag, fetchActivityLog, logActivityEntry } from "@/lib/api/reports";
import { mapServerReport } from "@/lib/api/mappers";
import { getSession } from "@/lib/api/auth";

import AdminSidebar, { type AdminView } from "@/components/admin/AdminSidebar";
import ReportList from "@/components/admin/ReportList";
import IncidentList from "@/components/admin/IncidentList";
import IncidentDetailPanel from "@/components/admin/IncidentDetailPanel";
import EditIncidentModal from "@/components/admin/EditIncidentModal";
import DeleteIncidentModal from "@/components/admin/DeleteIncidentModal";
import BlockedIPsPanel from "@/components/admin/BlockedIPsPanel";
import ActivityLog from "@/components/admin/ActivityLog";


export default function AdminPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>("reports");
  const [flags, setFlags] = useState<FlaggedIncident[]>([]);
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState("admin");

  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedIncident | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityLog, setActivityLog] = useState<Array<{
  id: string;
  action: "tagged" | "edited" | "deleted" | "blocked_ip" | "unblocked_ip" | "verified" | "restored";
  target: string;
  detail: string;
  timestamp: Date;
}>>([]);
  

  // Auth check
  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        setUserName(session.user.name || session.user.email);
        setAuthChecked(true);
      }
    }).catch(() => {
      router.push("/admin/login");
    });
  }, [router]);

  const addActivity = useCallback(async (
  action: "tagged" | "edited" | "deleted" | "blocked_ip" | "unblocked_ip" | "verified" | "restored",
  target: string,
  detail: string
) => {
  setActivityLog(prev => [{
    id: Date.now().toString(),
    action,
    target,
    detail,
    timestamp: new Date(),
  }, ...prev].slice(0, 50));
  try {
    await logActivityEntry(action, target, detail);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}, []);

  // Load reports
const loadReports = useCallback(async () => {
  if (!authChecked) return;
  setLoading(true);
  setError(null);
  try {
    const [approvedRes, pendingRes, rejectedRes] = await Promise.all([
      fetchApprovedReports(),
      fetchPendingReports(),
      fetchRejectedReports(),
    ]);

    const approvedCrimes = approvedRes.data.map(mapServerReport);

    const pendingCrimes = pendingRes.data.map((r) => ({
      id: r.reportId,
      title: r.title,
      type: r.type as any,
      location: r.locationText || r.upazila?.nameSnapshot || "Unknown location",
      lat: r.latitude ?? 23.8103,
      lng: r.longitude ?? 90.4125,
      severity: (r.severity as any) ?? "MEDIUM",
      workflowStatus: "PENDING" as any,
      description: r.description || "",
      reportedAt: new Date(r.submittedAt),
      createdAt: new Date(r.submittedAt),
      suspectName: r.suspectName,
      otherPeople: r.otherPeople,
      newsArticleUrl: r.newsArticleUrl,
      videoEvidenceUrl: r.videoEvidenceUrl,
      audioEvidenceUrl: r.audioEvidenceUrl,
      politicalParty: r.politicalParty,
    }));

    const rejectedCrimes = rejectedRes.data.map((r) => ({
      id: r.reportId,
      title: r.title,
      type: r.type as any,
      location: r.locationText || r.upazila?.nameSnapshot || "Unknown location",
      lat: r.latitude ?? 23.8103,
      lng: r.longitude ?? 90.4125,
      severity: (r.severity as any) ?? "MEDIUM",
      workflowStatus: "REJECTED" as any,
      description: r.description || "",
      reportedAt: new Date(r.submittedAt),
      createdAt: new Date(r.submittedAt),
      suspectName: r.suspectName,
      otherPeople: r.otherPeople,
      newsArticleUrl: r.newsArticleUrl,
      videoEvidenceUrl: r.videoEvidenceUrl,
      audioEvidenceUrl: r.audioEvidenceUrl,
      politicalParty: r.politicalParty,
    }));

    // // Map rejected crimes to FlaggedIncident shape for the Flagged Reports tab
    // const rejectedFlags: FlaggedIncident[] = rejectedRes.data.map((r) => ({
    //   id: `flag-${r.reportId}`,
    //   crimeId: r.reportId,
    //   tag: "fake" as any,
    //   flaggedAt: new Date(r.submittedAt),
    //   adminNote: "Rejected by moderator",
    //   submitterIP: "Unknown",
    //   ipBlocked: false,
    // }));

    // setFlags(rejectedFlags);
    // Rebuild flags from database tags
    const allCrimes = [...approvedCrimes, ...pendingCrimes, ...rejectedCrimes];
    const savedFlags: FlaggedIncident[] = allCrimes
      .filter(c => c.adminTag)
      .map(c => ({
        id: `flag-${c.id}`,
        crimeId: c.id,
        tag: c.adminTag as AdminTag,
        flaggedAt: c.createdAt,
        adminNote: "",
        submitterIP: "Unknown",
        ipBlocked: false,
      }));
    setFlags(savedFlags);
    setCrimes(allCrimes);
    const activityEntries = await fetchActivityLog();
    setActivityLog(activityEntries.map(e => ({
      id: e.id,
      action: e.action as any,
      target: e.target,
      detail: e.detail,
      timestamp: new Date(e.timestamp),
    })));
    const all = [...approvedCrimes, ...pendingCrimes, ...rejectedCrimes];
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to load reports");
  } finally {
    setLoading(false);
  }
}, [authChecked]);

    useEffect(() => {
    loadReports();
  }, [loadReports]);
  const getCrime = (crimeId: string) => crimes.find((c) => c.id === crimeId) || null;

  const stats = useMemo(() => ({
  total: crimes.length,
  pending: crimes.filter((c) => c.workflowStatus === "PENDING").length,
  actioned: crimes.filter((c) => c.workflowStatus === "APPROVED").length,
  dismissed: crimes.filter((c) => c.workflowStatus === "REJECTED").length,
}), [crimes]);


  const handleSelectFlag = (flag: FlaggedIncident) => {
    const crime = getCrime(flag.crimeId);
    if (crime) {
      setSelectedCrime(crime);
      setSelectedFlag(flag);
    }
  };


  const handleSelectCrime = (crime: Crime) => {
    setSelectedCrime(crime);
    const existingFlag = flags.find((f) => f.crimeId === crime.id) || null;
    setSelectedFlag(existingFlag);
  };


  const handleEditCrime = (crime: Crime) => {
    setSelectedCrime(crime);
    setShowEditModal(true);
  };

  const handleDeleteCrime = (crime: Crime) => {
    setSelectedCrime(crime);
    setShowDeleteModal(true);
  };


  const closePanel = () => {
    setSelectedCrime(null);
    setSelectedFlag(null);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setSelectedCrime(null);
    setSelectedFlag(null);
  };

  const closeDelete = () => {
    setShowDeleteModal(false);
    setSelectedCrime(null);
    setSelectedFlag(null);
  };

  const handleViewChange = (view: AdminView) => {
    setActiveView(view);
    closePanel();
  };


  const handleTagChange = async (tag: AdminTag) => {
  if (!selectedCrime) return;
  const existingFlag = flags.find(f => f.crimeId === selectedCrime.id);
  const isSameTag = existingFlag?.tag === tag;

  setFlags(prev => {
    if (isSameTag) {
      setSelectedFlag(null);
      return prev.filter(f => f.crimeId !== selectedCrime.id);
    }
    const newFlag: FlaggedIncident = {
      id: `flag-${selectedCrime.id}`,
      crimeId: selectedCrime.id,
      tag,
      flaggedAt: new Date(),
      adminNote: "",
      submitterIP: "Unknown",
      ipBlocked: false,
    };
    const existing = prev.findIndex(f => f.crimeId === selectedCrime.id);
    if (existing >= 0) {
      const updated = [...prev];
      updated[existing] = newFlag;
      setSelectedFlag(newFlag);
      return updated;
    }
    setSelectedFlag(newFlag);
    return [...prev, newFlag];
  });

  try {
    await setReportTag(selectedCrime.id, isSameTag ? null : tag);
    void addActivity("tagged", selectedCrime.id.slice(-8).toUpperCase(),
      isSameTag ? `Removed tag from: ${selectedCrime.title}` : `Tagged as ${tag}: ${selectedCrime.title}`
    );
  } catch (err) {
    console.error("Failed to save tag:", err);
  }
};

  const handleBlockIP = () => {
  };



const handleApprove = async () => {
  if (!selectedCrime) return;
  try {
    await approveReport(selectedCrime.id);
    void addActivity("verified", selectedCrime.id.slice(-8).toUpperCase(), `Approved: ${selectedCrime.title}`);
    closePanel();
    loadReports();
  } catch (err) {
    console.error("Failed to approve:", err);
  }
};

const handleUndoApprove = async () => {
  if (!selectedCrime) return;
  try {
    await setPendingReport(selectedCrime.id);
    void addActivity("restored", selectedCrime.id.slice(-8).toUpperCase(), `Undo approval: ${selectedCrime.title}`);
    closePanel();
    loadReports();
  } catch (err) {
    console.error("Failed to undo approval:", err);
  }
};

const handleUndoReject = async () => {
  if (!selectedCrime) return;
  try {
    await setPendingReport(selectedCrime.id);
    void addActivity("restored", selectedCrime.id.slice(-8).toUpperCase(), `Undo rejection: ${selectedCrime.title}`);
    closePanel();
    loadReports();
  } catch (err) {
    console.error("Failed to undo rejection:", err);
  }
};

const handleSaveNote = useCallback(async (note: string) => {
  if (!selectedCrime) return;
  // optimistically update local state so it shows immediately
  setCrimes(prev => prev.map(c =>
    c.id === selectedCrime.id ? { ...c, adminNote: note } : c
  ));
}, [selectedCrime]);



const handleReject = async () => {
  if (!selectedCrime) return;
  try {
    await rejectReport(selectedCrime.id);
    void addActivity("deleted", selectedCrime.id.slice(-8).toUpperCase(), `Rejected: ${selectedCrime.title}`);
    closePanel();
    loadReports();
  } catch (err) {
    console.error("Failed to reject:", err);
  }
};




  const VIEW_TITLES: Record<AdminView, string> = {
    reports: "Flagged Reports",
    all_data: "All Incidents",
    blocked_ips: "Blocked IPs",
    activity: "Activity Log",
  };

  if (!authChecked) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-black">
        <div className="flex items-center gap-2 text-white/50">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-black text-white">
      {/* Desktop Sidebar */}
      <AdminSidebar activeView={activeView} onViewChange={handleViewChange} stats={stats} userName={userName} />

      {/* Main Content */}
      <main className="relative flex-1 h-full overflow-hidden flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <a href="/" className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-b border-white/10 shrink-0 overflow-x-auto">
          {([
            { key: "reports", icon: Flag, label: "Reports" },
            { key: "all_data", icon: BarChart3, label: "All Data" },
            { key: "blocked_ips", icon: Globe, label: "IPs" },
            { key: "activity", icon: ScrollText, label: "Log" },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => handleViewChange(item.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all shrink-0",
                activeView === item.key
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-3 h-3" />
              {item.label}
            </button>
          ))}
        </div>

        {activeView === "reports" && (
          <div className="lg:hidden px-4 py-3 border-b border-white/10 shrink-0">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Total", value: stats.total, hl: false },
                { label: "Pending", value: stats.pending, hl: stats.pending > 0 },
                { label: "Actioned", value: stats.actioned, hl: false },
                { label: "Dismissed", value: stats.dismissed, hl: false },
              ].map((s) => (
                <div key={s.label} className={cn("rounded-md p-2 border transition-all", s.hl ? "bg-white/5 border-white/20" : "border-white/10")}>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">{s.label}</p>
                  <p className={cn("text-lg font-bold font-mono tabular-nums", s.hl ? "text-white" : "text-white/70")}>{s.value.toString().padStart(2, "0")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 pt-4 pb-2 shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
            {VIEW_TITLES[activeView]}
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-white/50">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading reports...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <span className="text-xs text-red-400">{error}</span>
            <button onClick={loadReports} className="text-xs text-white underline">Retry</button>
          </div>
        )}

        {!loading && (
          <ScrollArea className="flex-1">
            <div className="px-4 pb-4">
              {activeView === "reports" && (
                <ReportList
                  flags={flags}
                  crimes={crimes}
                  onSelect={handleSelectFlag}
                  selectedId={selectedFlag?.id || null}
                />
              )}

              {activeView === "all_data" && (
                <IncidentList
                 crimes={crimes}
                 flags={flags}
                 onSelect={handleSelectCrime}
                 onEdit={handleEditCrime}
                 onDelete={handleDeleteCrime}
                 selectedId={selectedCrime?.id || null}
/>
              )}

              {activeView === "blocked_ips" && (
                <BlockedIPsPanel blockedIPs={MOCK_BLOCKED_IPS} />
              )}

              {activeView === "activity" && (
                <ActivityLog entries={activityLog} />
              )}
            </div>
          </ScrollArea>
        )}
      </main>

      {selectedCrime && !showEditModal && !showDeleteModal && (
        <IncidentDetailPanel
          crime={selectedCrime}
          flag={selectedFlag}
          onClose={closePanel}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => setShowDeleteModal(true)}
          onTagChange={handleTagChange}
          onBlockIP={handleBlockIP}
          onApprove={handleApprove}
          onReject={handleReject}
          onUndoApprove={handleUndoApprove}
          onSaveNote={handleSaveNote}
          onUndoReject={handleUndoReject}

        />
      )}

      {showEditModal && selectedCrime && (
        <EditIncidentModal crime={selectedCrime} onClose={closeEdit} onSaved={() => { addActivity("edited", selectedCrime.id.slice(-8).toUpperCase(), `Edited: ${selectedCrime.title}`); loadReports(); }} />
      )}

      {showDeleteModal && selectedCrime && (
        <DeleteIncidentModal crime={selectedCrime} onClose={closeDelete} onDeleted={() => { addActivity("deleted", selectedCrime.id.slice(-8).toUpperCase(), `Deleted: ${selectedCrime.title}`); loadReports(); }} />
      )}
    </div>
  );
}
