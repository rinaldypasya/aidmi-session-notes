"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn, formatTimestamp } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { TranscriptSegment } from "@/types";
import { User, Stethoscope, MessageCircle } from "lucide-react";

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  activeIds: Set<string>;
  hoveredId: string | null;
  citingNoteIds: Map<string, Set<string>>;
  onSegmentClick: (segment: TranscriptSegment) => void;
  onSegmentHover: (segmentId: string | null) => void;
}

export function TranscriptPanel({
  segments,
  activeIds,
  hoveredId,
  citingNoteIds,
  onSegmentClick,
  onSegmentHover,
}: TranscriptPanelProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  // Scroll to active segment when selection changes
  useEffect(() => {
    if (activeIds.size > 0 && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIds]);

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Panel Header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-gradient-to-r from-slate-50 to-slate-100/50 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200/80">
          <MessageCircle className="h-4.5 w-4.5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Session Transcript
          </h2>
          <p className="text-xs text-muted-foreground">
            {segments.length} segments • Click notes to highlight evidence
          </p>
        </div>
      </div>

      {/* Transcript Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-4">
          {segments.map((segment, index) => {
            const isActive = activeIds.has(segment.id);
            const isHovered = hoveredId === segment.id;
            const hasCitations = citingNoteIds.has(segment.id);

            return (
              <motion.div
                key={segment.id}
                ref={isActive ? activeRef : null}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                className={cn(
                  "group relative rounded-xl p-4 transition-all duration-300 cursor-pointer",
                  "border border-transparent",
                  isActive && [
                    "bg-citation-muted border-citation/30",
                    "ring-2 ring-citation/20 ring-offset-1",
                    "shadow-lg shadow-citation/10",
                  ],
                  !isActive &&
                    isHovered && [
                      "bg-muted/50 border-border/50",
                      "shadow-md",
                    ],
                  !isActive &&
                    !isHovered &&
                    hasCitations && [
                      "hover:bg-muted/30",
                      "hover:border-citation/20",
                    ],
                  !isActive && !isHovered && !hasCitations && "hover:bg-muted/20"
                )}
                onClick={() => hasCitations && onSegmentClick(segment)}
                onMouseEnter={() => onSegmentHover(segment.id)}
                onMouseLeave={() => onSegmentHover(null)}
                role="button"
                tabIndex={hasCitations ? 0 : -1}
                aria-label={`${segment.speaker === "clinician" ? "Clinician" : "Patient"} at ${formatTimestamp(segment.startMs)}: ${segment.text}`}
                aria-pressed={isActive}
              >
                {/* Speaker indicator line */}
                <div
                  className={cn(
                    "absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-300",
                    segment.speaker === "clinician"
                      ? "bg-clinician"
                      : "bg-patient",
                    isActive && "w-1.5"
                  )}
                />

                <div className="ml-3">
                  {/* Header row */}
                  <div className="mb-2 flex items-center gap-3">
                    {/* Speaker badge */}
                    <Badge
                      variant={
                        segment.speaker === "clinician" ? "clinician" : "patient"
                      }
                      className="gap-1.5 pr-2.5"
                    >
                      {segment.speaker === "clinician" ? (
                        <Stethoscope className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {segment.speaker === "clinician" ? "Clinician" : "Patient"}
                    </Badge>

                    {/* Timestamp */}
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatTimestamp(segment.startMs)}
                    </span>

                    {/* Citation indicator */}
                    {hasCitations && (
                      <span
                        className={cn(
                          "ml-auto text-[10px] font-medium uppercase tracking-wider",
                          "text-citation/70 opacity-0 transition-opacity duration-200",
                          "group-hover:opacity-100",
                          isActive && "opacity-100"
                        )}
                      >
                        {citingNoteIds.get(segment.id)?.size} citation
                        {(citingNoteIds.get(segment.id)?.size || 0) > 1
                          ? "s"
                          : ""}
                      </span>
                    )}
                  </div>

                  {/* Transcript text */}
                  <p
                    className={cn(
                      "text-sm leading-relaxed transition-colors duration-200",
                      isActive
                        ? "text-foreground font-medium"
                        : "text-foreground/80"
                    )}
                  >
                    {segment.text}
                  </p>
                </div>

                {/* Active highlight effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-citation/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="border-t border-border/30 bg-muted/20 px-4 py-2.5">
        <p className="text-center text-xs text-muted-foreground">
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Click
          </kbd>{" "}
          highlighted segments to see related notes
        </p>
      </div>
    </div>
  );
}
