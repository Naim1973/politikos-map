"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Crime } from "@/lib/crime-data";
import { deleteReport } from "@/lib/api/reports";

interface DeleteIncidentModalProps {
  crime: Crime;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DeleteIncidentModal({ crime, onClose, onDeleted }: DeleteIncidentModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteReport(crime.id);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[22rem] max-w-[92vw] bg-black border border-white/15 rounded-lg shadow-2xl shadow-white/5 overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Remove Incident</h3>
            <p className="text-xs text-white/40 mt-1">
              Are you sure you want to remove <strong className="text-white/70">&quot;{crime.title}&quot;</strong>?
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-md p-3">
            <p className="text-[10px] text-white/50 leading-relaxed">
              <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />
              This action will permanently remove this incident. This cannot be undone.
            </p>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1 text-xs" disabled={deleting}>Cancel</Button>
            <Button variant="destructive" size="sm" className="flex-1 text-xs gap-1.5" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              {deleting ? "Removing..." : "Confirm Remove"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}