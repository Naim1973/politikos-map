"use client";

import { useState, useRef, forwardRef } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Crime } from "@/lib/crime-data";
import { updateReport } from "@/lib/api/reports";

interface EditIncidentModalProps {
  crime: Crime;
  onClose: () => void;
  onSaved?: () => void;
}

export default function EditIncidentModal({ crime, onClose, onSaved }: EditIncidentModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const severityRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const newsRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const suspectRef = useRef<HTMLInputElement>(null);
  const othersRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateReport(crime.id, {
        title: titleRef.current?.value,
        description: descRef.current?.value,
        locationText: locationRef.current?.value,
        type: typeRef.current?.value,
        severity: severityRef.current?.value,
        workflowStatus: statusRef.current?.value,
        newsArticleUrl: newsRef.current?.value,
        videoEvidenceUrl: videoRef.current?.value,
        audioEvidenceUrl: audioRef.current?.value,
        suspectName: suspectRef.current?.value,
        otherPeople: othersRef.current?.value,
        adminNote: noteRef.current?.value,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[28rem] max-w-[92vw] max-h-[90vh] overflow-hidden bg-black border border-white/15 rounded-lg shadow-2xl shadow-white/5 flex flex-col">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Edit Incident</h2>
            <p className="text-xs text-white/40 mt-0.5">{crime.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0 space-y-4">
          <Field label="Title" defaultValue={crime.title} ref={titleRef} />
          <Field label="Description" defaultValue={crime.description} multiline ref={descRef} />
          <Field label="Location" defaultValue={crime.location} ref={locationRef} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Type" defaultValue={crime.type} ref={typeRef} options={[
              { value: "assault", label: "Assault" },
              { value: "robbery", label: "Robbery" },
              { value: "burglary", label: "Burglary" },
              { value: "vandalism", label: "Vandalism" },
              { value: "theft", label: "Theft" },
              { value: "homicide", label: "Homicide" },
              { value: "drug_offense", label: "Drug Offense" },
              { value: "fraud", label: "Fraud" },
              { value: "corruption", label: "Corruption" },
            ]} />
            <SelectField label="Severity" defaultValue={crime.severity} ref={severityRef} options={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "CRITICAL", label: "Critical" },
            ]} />
          </div>
          <SelectField label="Status" defaultValue={crime.workflowStatus} ref={statusRef} options={[
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ]} />
          <Field label="News Article URL" defaultValue={crime.newsArticleUrl || ""} ref={newsRef} />
          <Field label="Video Evidence URL" defaultValue={crime.videoEvidenceUrl || ""} ref={videoRef} />
          <Field label="Audio Evidence URL" defaultValue={crime.audioEvidenceUrl || ""} ref={audioRef} />
          <Field label="Suspect" defaultValue={crime.suspectName || ""} ref={suspectRef} />
          <Field label="Others Involved" defaultValue={crime.otherPeople || ""} ref={othersRef} />
          <Separator />
          <Field label="Admin Note" defaultValue={crime.adminNote || ""} multiline ref={noteRef} placeholder="Explain why this data is being modified..." />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-white/50" disabled={saving}>Cancel</Button>
          <Button size="sm" className="text-xs font-semibold uppercase tracking-wider gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );
}

const Field = forwardRef<any, { label: string; defaultValue: string; multiline?: boolean; placeholder?: string }>(
  ({ label, defaultValue, multiline, placeholder }, ref) => (
    <div>
      <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">{label}</label>
      {multiline ? (
        <textarea ref={ref} defaultValue={defaultValue} placeholder={placeholder} rows={3} className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors resize-none" />
      ) : (
        <input ref={ref} type="text" defaultValue={defaultValue} placeholder={placeholder} className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors" />
      )}
    </div>
  )
);
Field.displayName = "Field";

const SelectField = forwardRef<HTMLSelectElement, { label: string; defaultValue: string; options: { value: string; label: string }[] }>(
  ({ label, defaultValue, options }, ref) => (
    <div>
      <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">{label}</label>
      <select ref={ref} defaultValue={defaultValue} className="w-full appearance-none bg-white/5 border border-white/20 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors">
        {options.map((o) => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}
      </select>
    </div>
  )
);
SelectField.displayName = "SelectField";