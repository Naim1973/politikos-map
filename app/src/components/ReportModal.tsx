"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  X,
  Link,
  Video,
  AudioLines,
  UserCheck,
  Users,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  MapPin,
  FileText,
  Shield,
  CheckCircle2,
  Loader2,
  Flame,
  Package,
  Hammer,
  Car,
  AlertCircle,
  Pill,
  CreditCard,
  Landmark,
  Navigation,
  Type as TypeIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CrimeType, PoliticalParty, Severity } from "@/lib/crime-data";
import { submitReport } from "@/lib/api/reports";

// ─── Types ───────────────────────────────────────────────────────────────

interface ReportFormData {
  type: CrimeType | "";
  title: string;
  location: string;
  lat: number | null;
  lng: number | null;
  description: string;
  severity: Severity | "";
  party: PoliticalParty | "";
  newsArticleUrl: string;
  videoEvidenceUrl: string;
  audioEvidenceUrl: string;
  suspect: string;
  others: string;
}

const INITIAL_FORM: ReportFormData = {
  type: "",
  title: "",
  location: "",
  lat: null,
  lng: null,
  description: "",
  severity: "",
  party: "",
  newsArticleUrl: "",
  videoEvidenceUrl: "",
  audioEvidenceUrl: "",
  suspect: "",
  others: "",
};

const CRIME_TYPES: { value: CrimeType; label: string; icon: LucideIcon }[] = [
  { value: "corruption", label: "Corruption", icon: Landmark },
  { value: "assault", label: "Assault", icon: Flame },
  { value: "robbery", label: "Robbery", icon: Shield },
  { value: "theft", label: "Theft", icon: Car },
  { value: "fraud", label: "Fraud", icon: CreditCard },
  { value: "homicide", label: "Homicide", icon: AlertCircle },
  { value: "burglary", label: "Burglary", icon: Package },
  { value: "vandalism", label: "Vandalism", icon: Hammer },
  { value: "drug_offense", label: "Drug Offense", icon: Pill },
];

const SEVERITY_OPTIONS: {
  value: Severity;
  label: string;
  color: string;
  ring: string;
}[] = [
  { value: "LOW", label: "Low", color: "bg-white/20 text-white/70", ring: "ring-white/30" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-500/20 text-yellow-400", ring: "ring-yellow-500/40" },
  { value: "HIGH", label: "High", color: "bg-orange-500/20 text-orange-400", ring: "ring-orange-500/40" },
  { value: "CRITICAL", label: "Critical", color: "bg-red-500/20 text-red-400", ring: "ring-red-500/40" },
];

const PARTIES: PoliticalParty[] = ["BNP", "Jamaat", "Awami League", "Independent"];

const STEPS = [
  { id: 0, title: "Incident", icon: AlertTriangle },
  { id: 1, title: "Details", icon: FileText },
  { id: 2, title: "Evidence", icon: Shield },
  { id: 3, title: "Review", icon: CheckCircle2 },
];


async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data?.display_name) {
      // Return a shortened version: take the first 3-4 parts
      const parts = data.display_name.split(", ");
      return parts.slice(0, 4).join(", ");
    }
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}


interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReportModal({ open, onClose }: ReportModalProps) {
  const [form, setForm] = useState<ReportFormData>(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof ReportFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setStep(0);
      setErrors({});
      setSubmitting(false);
      setSubmitted(false);
      setSubmitError(null);
      setTrackingCode(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const updateField = useCallback(
    <K extends keyof ReportFormData>(key: K, value: ReportFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const updateMultipleFields = useCallback(
    (updates: Partial<ReportFormData>) => {
      setForm((prev) => ({ ...prev, ...updates }));
      setErrors((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(updates)) {
          delete next[key as keyof ReportFormData];
        }
        return next;
      });
    },
    []
  );


  const validateStep = (s: number): boolean => {
    const errs: Partial<Record<keyof ReportFormData, string>> = {};
    if (s === 0) {
      if (!form.type) errs.type = "Select an incident type";
      if (!form.severity) errs.severity = "Select severity level";
    }
    if (s === 1) {
      if (!form.title.trim()) errs.title = "Title is required";
      if (!form.location.trim()) errs.location = "Location is required";
      if (form.lat === null || form.lng === null)
        errs.location = "Select a location on the map or use your current location";
      if (!form.description.trim()) errs.description = "Description is required";
      if (form.description.trim().length > 0 && form.description.trim().length < 10)
        errs.description = "Description must be at least 10 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitReport({
        category: form.type,
        title: form.title,
        description: form.description,
        location: form.location ? { 
    addressText: form.location,
    lat: form.lat ?? undefined,
    lng: form.lng ?? undefined,
  } : undefined,
        severity: form.severity,
        politicalParty: form.party || undefined,
        suspectName: form.suspect || undefined,
        otherPeople: form.others || undefined,
        newsArticleUrl: form.newsArticleUrl || undefined,
        videoEvidenceUrl: form.videoEvidenceUrl || undefined,
        audioEvidenceUrl: form.audioEvidenceUrl || undefined,
      });
      setTrackingCode(res.data.trackingCode);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;


  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Report incident"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[28rem] max-w-[92vw] max-h-[90vh] overflow-hidden bg-black border border-white/15 rounded-xl shadow-2xl flex flex-col"
      >
        <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Report Incident
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Step {step + 1} of {STEPS.length} — {STEPS[step].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* steps */}
        <div className="px-5 pb-4 shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div
                  className={cn(
                    "h-1 w-full rounded-full transition-all duration-300",
                    i < step
                      ? "bg-white"
                      : i === step
                      ? "bg-white/60"
                      : "bg-white/10"
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0">
          {submitted ? (
            <SuccessView trackingCode={trackingCode} />
          ) : (
            <>
              {step === 0 && (
                <StepIncident
                  form={form}
                  errors={errors}
                  updateField={updateField}
                />
              )}
              {step === 1 && (
                <StepDetails
                  form={form}
                  errors={errors}
                  updateField={updateField}
                  updateMultipleFields={updateMultipleFields}
                />
              )}
              {step === 2 && (
                <StepEvidence form={form} updateField={updateField} />
              )}
              {step === 3 && <StepReview form={form} />}
            </>
          )}
        </div>

        {/* ── Submit error ────────────────────────────────────── */}
        {submitError && (
          <div className="mx-5 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400">{submitError}</p>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────── */}
        {!submitted && (
          <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={step === 0 ? onClose : goBack}
              className="text-xs text-white/50 hover:text-white gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            {step < 3 ? (
              <Button
                size="sm"
                onClick={goNext}
                className="text-xs font-semibold uppercase tracking-wider gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="text-xs font-semibold uppercase tracking-wider gap-1.5 min-w-[120px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submit Report
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Close button for success view */}
        {submitted && (
          <div className="px-5 py-4 border-t border-white/10 flex justify-center shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-white/50 hover:text-white"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </>
  );
}


function StepIncident({
  form,
  errors,
  updateField,
}: {
  form: ReportFormData;
  errors: Partial<Record<keyof ReportFormData, string>>;
  updateField: <K extends keyof ReportFormData>(key: K, val: ReportFormData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Crime Type Grid */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
          Incident Type
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {CRIME_TYPES.map((ct) => {
            const Icon = ct.icon;
            return (
              <button
                key={ct.value}
                type="button"
                onClick={() => updateField("type", ct.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-all duration-150",
                  form.type === ct.value
                    ? "bg-white/10 border-white/40 text-white"
                    : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/25 hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{ct.label}</span>
              </button>
            );
          })}
        </div>
        {errors.type && <p className="text-xs text-red-400 mt-1.5">{errors.type}</p>}
      </div>

      {/* Severity */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
          Severity Level
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {SEVERITY_OPTIONS.map((sev) => (
            <button
              key={sev.value}
              type="button"
              onClick={() => updateField("severity", sev.value)}
              className={cn(
                "px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150",
                form.severity === sev.value
                  ? `${sev.color} border-transparent ring-2 ${sev.ring}`
                  : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/25"
              )}
            >
              {sev.label}
            </button>
          ))}
        </div>
        {errors.severity && (
          <p className="text-xs text-red-400 mt-1.5">{errors.severity}</p>
        )}
      </div>

      {/* Party > only if corruption */}
      {form.type === "corruption" && (
        <div className="animate-slide-up">
          <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
            Party Involved
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PARTIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateField("party", form.party === p ? "" : p)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150",
                  form.party === p
                    ? "bg-white/10 border-white/40 text-white"
                    : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/25"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function LocationMapPicker({
  lat,
  lng,
  onSelect,
}: {
  lat: number | null;
  lng: number | null;
  onSelect: (lat: number, lng: number, address: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    const init = async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (cancelled || !containerRef.current) return;

      const mapInstance = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            "osm-tiles": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm-tiles-layer",
              type: "raster",
              source: "osm-tiles",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [lng ?? 90.4125, lat ?? 23.8103],
        zoom: lat && lng ? 14 : 7,
        maxZoom: 18,
        attributionControl: false,
      });

      mapInstanceRef.current = mapInstance;

      if (lat !== null && lng !== null) {
        markerRef.current = new maplibregl.Marker({ color: "#ef4444" })
          .setLngLat([lng, lat])
          .addTo(mapInstance);
      }

      // Click handler to move
      mapInstance.on("click", async (e: any) => {
        const { lng: clickLng, lat: clickLat } = e.lngLat;

        if (markerRef.current) {
          markerRef.current.setLngLat([clickLng, clickLat]);
        } else {
          markerRef.current = new maplibregl.Marker({ color: "#ef4444" })
            .setLngLat([clickLng, clickLat])
            .addTo(mapInstance);
        }

        const address = await reverseGeocode(clickLat, clickLng);
        onSelect(clickLat, clickLng, address);
      });

      // Change cursor on hover
      mapInstance.getCanvas().style.cursor = "crosshair";
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when lat/lng change externally (e.g. from geolocation)
  useEffect(() => {
    if (!mapInstanceRef.current || lat === null || lng === null) return;

    const loadMarker = async () => {
      const maplibregl = (await import("maplibre-gl")).default;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new maplibregl.Marker({ color: "#ef4444" })
          .setLngLat([lng, lat])
          .addTo(mapInstanceRef.current);
      }

      mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1000 });
    };

    loadMarker();
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[180px] rounded-lg border border-white/10 overflow-hidden"
    />
  );
}

// ─── Step Details (with map + geolocation) ───────────────────────────────────

function StepDetails({
  form,
  errors,
  updateField,
  updateMultipleFields,
}: {
  form: ReportFormData;
  errors: Partial<Record<keyof ReportFormData, string>>;
  updateField: <K extends keyof ReportFormData>(key: K, val: ReportFormData[K]) => void;
  updateMultipleFields: (updates: Partial<ReportFormData>) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleMapSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      updateMultipleFields({ lat, lng, location: address });
    },
    [updateMultipleFields]
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        updateMultipleFields({ lat: latitude, lng: longitude, location: address });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("Location permission denied. Please allow location access.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("Location unavailable. Try again later.");
            break;
          case err.TIMEOUT:
            setGeoError("Location request timed out. Try again.");
            break;
          default:
            setGeoError("Unable to get your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [updateMultipleFields]);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
          Title
        </label>
        <div className="relative">
          <TypeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Brief title for the incident..."
            className={cn(
              "w-full bg-white/5 border rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none transition-colors",
              errors.title ? "border-red-500/50 focus:border-red-400" : "border-white/10 focus:border-white/30"
            )}
          />
        </div>
        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
      </div>

      {/* Location */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
          Location
        </label>

        {/* Text input */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Enter location or select on map..."
            className={cn(
              "w-full bg-white/5 border rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none transition-colors",
              errors.location ? "border-red-500/50 focus:border-red-400" : "border-white/10 focus:border-white/30"
            )}
          />
        </div>

        {/* Use My Location button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {locating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          {locating ? "Getting your location…" : "Use my current location"}
        </button>

        {geoError && <p className="text-xs text-red-400 mt-1">{geoError}</p>}

        {/* Mini-map for pin selection */}
        <div className="mt-2">
          <p className="text-xs text-white/30 mb-1.5">
            Click on the map to select the incident location
          </p>
          <LocationMapPicker lat={form.lat} lng={form.lng} onSelect={handleMapSelect} />
        </div>

        {/* Coordinates display */}
        {form.lat !== null && form.lng !== null && (
          <p className="text-xs text-white/30 mt-1.5">
            📍 {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
          </p>
        )}

        {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe the incident in detail..."
          rows={4}
          className={cn(
            "w-full bg-white/5 border rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none resize-none transition-colors leading-relaxed",
            errors.description ? "border-red-500/50 focus:border-red-400" : "border-white/10 focus:border-white/30"
          )}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-red-400">{errors.description}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-white/30">{form.description.length} chars</span>
        </div>
      </div>

      {/* People involved */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
          People Involved
        </label>
        <div className="space-y-2">
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              value={form.suspect}
              onChange={(e) => updateField("suspect", e.target.value)}
              placeholder="Suspect name (optional)..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              value={form.others}
              onChange={(e) => updateField("others", e.target.value)}
              placeholder="Others involved (optional)..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepEvidence({
  form,
  updateField,
}: {
  form: ReportFormData;
  updateField: <K extends keyof ReportFormData>(key: K, val: ReportFormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-white/40 leading-relaxed">
        Attach links to evidence to strengthen your report. All fields are optional.
      </p>

      <EvidenceInput
        icon={Link}
        label="News Article"
        placeholder="https://example.com/article..."
        value={form.newsArticleUrl}
        onChange={(v) => updateField("newsArticleUrl", v)}
      />
      <EvidenceInput
        icon={Video}
        label="Video Evidence"
        placeholder="https://youtube.com/watch?v=..."
        value={form.videoEvidenceUrl}
        onChange={(v) => updateField("videoEvidenceUrl", v)}
      />
      <EvidenceInput
        icon={AudioLines}
        label="Audio Evidence"
        placeholder="https://drive.google.com/audio/..."
        value={form.audioEvidenceUrl}
        onChange={(v) => updateField("audioEvidenceUrl", v)}
      />
    </div>
  );
}

function EvidenceInput({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>
    </div>
  );
}

function StepReview({ form }: { form: ReportFormData }) {
  const selectedType = CRIME_TYPES.find((ct) => ct.value === form.type);
  const selectedSeverity = SEVERITY_OPTIONS.find((s) => s.value === form.severity);

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40 mb-1">
        Review the details below before submitting.
      </p>

      <div className="space-y-2.5">
        {selectedType && (
          <ReviewRow label="Type" icon={selectedType.icon} value={selectedType.label} />
        )}
        <ReviewRow
          label="Severity"
          value={selectedSeverity?.label ?? "—"}
          badge
          badgeClass={selectedSeverity?.color}
        />
        {form.party && <ReviewRow label="Party" value={form.party} />}
        <ReviewRow label="Title" value={form.title || "—"} />
        <ReviewRow label="Location" value={form.location || "—"} />
        {form.lat !== null && form.lng !== null && (
          <ReviewRow
            label="Coordinates"
            value={`${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`}
          />
        )}
        <ReviewRow label="Description" value={form.description || "—"} multiline />
        {form.suspect && <ReviewRow label="Suspect" value={form.suspect} />}
        {form.others && <ReviewRow label="Others" value={form.others} />}
        {form.newsArticleUrl && <ReviewRow label="News Link" value={form.newsArticleUrl} link />}
        {form.videoEvidenceUrl && <ReviewRow label="Video" value={form.videoEvidenceUrl} link />}
        {form.audioEvidenceUrl && <ReviewRow label="Audio" value={form.audioEvidenceUrl} link />}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  icon: Icon,
  multiline,
  badge,
  badgeClass,
  link,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  multiline?: boolean;
  badge?: boolean;
  badgeClass?: string;
  link?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 uppercase tracking-wider w-20 shrink-0 pt-0.5">
        {label}
      </span>
      {badge ? (
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", badgeClass)}>
          {value}
        </span>
      ) : link ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className={cn("text-xs text-white/70 flex items-center gap-1.5", multiline && "leading-relaxed")}>
          {Icon && <Icon className="w-3.5 h-3.5 text-white/50 shrink-0" />}
          {value}
        </span>
      )}
    </div>
  );
}

function SuccessView({ trackingCode }: { trackingCode: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center animate-slide-up">
      <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
      </div>
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
        Report Submitted
      </h3>
      <p className="text-xs text-white/40 max-w-[220px]">
        Your report has been received and will be reviewed by moderators.
      </p>
      {trackingCode && (
        <div className="mt-4 px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Tracking Code</p>
          <p className="text-sm font-mono font-bold text-white tracking-wider">{trackingCode}</p>
          <p className="text-[10px] text-white/30 mt-1">Save this to check your report status</p>
        </div>
      )}
    </div>
  );
}
