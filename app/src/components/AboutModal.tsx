"use client";

import { X, MapPin, Shield, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[99] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[28rem] max-w-[92vw] max-h-[85vh] overflow-y-auto bg-black border border-white/15 rounded-xl shadow-2xl">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-white/10">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Crime Map Bangladesh
              </h2>
              <p className="text-[10px] text-white/40 mt-0.5">Alpha Version</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Separator className="bg-white/10" />

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs text-white/70 leading-relaxed">
            Welcome to Crime Map Bangladesh.
          </p>
          <p className="text-xs text-white/70 leading-relaxed">
            Right now, when corruption or crime occurs, it flashes on social
            media and disappears. We are building an interactive, crowdsourced
            map to change that.
          </p>
          <p className="text-xs text-white/70 leading-relaxed">
            The goal is to turn scattered incidents into a verified, permanent
            public record that can officially assist law enforcement and demand
            accountability.
          </p>

          <Separator className="bg-white/10" />

          <div className="grid grid-cols-3 gap-3">
            <FeatureCard
              icon={Users}
              title="Crowdsourced"
              desc="Anyone can submit a report"
            />
            <FeatureCard
              icon={Shield}
              title="Verified"
              desc="Moderated before publishing"
            />
            <FeatureCard
              icon={BarChart3}
              title="Permanent"
              desc="Public record for accountability"
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-1.5">
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              Coming in Next Release
            </p>
            <ul className="space-y-1">
              {[
                "Party affiliation filtering",
                "IP blocking for spam prevention",
                "Advanced statistics dashboard",
                "Tracking code lookup",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-white/50">
                  <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1.5">
      <div className="p-1.5 rounded bg-white/10 w-fit">
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <p className="text-xs font-semibold text-white">{title}</p>
      <p className="text-[10px] text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}