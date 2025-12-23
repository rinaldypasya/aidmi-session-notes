"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NoteSpan, SOAPSection } from "@/types";
import { SOAP_SECTIONS, SOAP_LABELS, SOAP_DESCRIPTIONS } from "@/types";
import {
  FileText,
  AlertTriangle,
  Link2,
  Check,
  X,
  Pencil,
  Sparkles,
} from "lucide-react";

interface NotePanelProps {
  noteSpans: NoteSpan[];
  activeNoteSpanId: string | null;
  hoveredNoteSpanId: string | null;
  editingNoteSpanId: string | null;
  focusedNoteIndex: number;
  sessionStatus: string;
  onNoteSpanClick: (noteSpan: NoteSpan) => void;
  onNoteSpanHover: (noteSpanId: string | null) => void;
  onStartEditing: (noteSpanId: string) => void;
  onCancelEditing: () => void;
  onSaveEdit: (noteSpanId: string, newText: string) => void;
}

const sectionIcons: Record<SOAPSection, React.ReactNode> = {
  subjective: <span className="text-lg">S</span>,
  objective: <span className="text-lg">O</span>,
  assessment: <span className="text-lg">A</span>,
  plan: <span className="text-lg">P</span>,
};

const sectionColors: Record<SOAPSection, string> = {
  subjective: "from-blue-500/10 to-blue-600/5 border-blue-200/50",
  objective: "from-emerald-500/10 to-emerald-600/5 border-emerald-200/50",
  assessment: "from-amber-500/10 to-amber-600/5 border-amber-200/50",
  plan: "from-purple-500/10 to-purple-600/5 border-purple-200/50",
};

const sectionAccentColors: Record<SOAPSection, string> = {
  subjective: "bg-blue-500",
  objective: "bg-emerald-500",
  assessment: "bg-amber-500",
  plan: "bg-purple-500",
};

export function NotePanel({
  noteSpans,
  activeNoteSpanId,
  hoveredNoteSpanId,
  editingNoteSpanId,
  focusedNoteIndex,
  sessionStatus,
  onNoteSpanClick,
  onNoteSpanHover,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
}: NotePanelProps) {
  const activeRef = useRef<HTMLDivElement>(null);
  const focusedRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Group note spans by section
  const spansBySection = SOAP_SECTIONS.reduce(
    (acc, section) => {
      acc[section] = noteSpans.filter((span) => span.section === section);
      return acc;
    },
    {} as Record<SOAPSection, NoteSpan[]>
  );

  // Count issues
  const needsConfirmationCount = noteSpans.filter(
    (span) => span.needsConfirmation
  ).length;

  // Scroll to focused note when focusedNoteIndex changes via keyboard navigation
  useEffect(() => {
    if (focusedNoteIndex >= 0 && focusedNoteIndex < noteSpans.length) {
      const element = focusedRefs.current.get(focusedNoteIndex);
      if (!element) return;

      // Find the scroll container (Radix ScrollArea viewport)
      const scrollViewport = element.closest('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (!scrollViewport) return;

      // Get element and viewport positions
      const elementRect = element.getBoundingClientRect();
      const viewportRect = scrollViewport.getBoundingClientRect();

      // Calculate the scroll offset needed to center the element
      const currentScrollTop = scrollViewport.scrollTop;
      const elementTopRelativeToViewport = elementRect.top - viewportRect.top;
      const scrollOffset = elementTopRelativeToViewport - (viewportRect.height / 2) + (elementRect.height / 2);

      // Smooth scroll to the calculated position
      scrollViewport.scrollTo({
        top: currentScrollTop + scrollOffset,
        behavior: "smooth",
      });
    }
  }, [focusedNoteIndex, noteSpans.length]);

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-indigo-50 to-violet-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
            <FileText className="h-4.5 w-4.5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Clinical Note
            </h2>
            <p className="text-xs text-muted-foreground">
              SOAP format • Click claims to verify evidence
            </p>
          </div>
        </div>

        {needsConfirmationCount > 0 && (
          <Badge
            variant="warning"
            className="gap-1.5 animate-pulse"
          >
            <AlertTriangle className="h-3 w-3" />
            {needsConfirmationCount} needs review
          </Badge>
        )}
      </div>

      {/* Note Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-5">
          {SOAP_SECTIONS.map((section, sectionIndex) => {
            const spans = spansBySection[section];
            if (spans.length === 0) return null;

            return (
              <motion.section
                key={section}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1, duration: 0.4 }}
                className={cn(
                  "rounded-xl border bg-gradient-to-br p-4",
                  sectionColors[section]
                )}
              >
                {/* Section header */}
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white",
                      sectionAccentColors[section]
                    )}
                  >
                    {sectionIcons[section]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {SOAP_LABELS[section]}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {SOAP_DESCRIPTIONS[section]}
                    </p>
                  </div>
                </div>

                {/* Section spans */}
                <div className="space-y-2">
                  {spans.map((span) => {
                    const globalIndex = noteSpans.findIndex(
                      (s) => s.id === span.id
                    );
                    const isActive = activeNoteSpanId === span.id;
                    const isHovered = hoveredNoteSpanId === span.id;
                    const isFocused = focusedNoteIndex === globalIndex;
                    const isEditing = editingNoteSpanId === span.id;

                    return (
                      <NoteSpanItem
                        key={span.id}
                        span={span}
                        isActive={isActive}
                        isHovered={isHovered}
                        isFocused={isFocused}
                        isEditing={isEditing}
                        isReadOnly={sessionStatus === "signed"}
                        ref={(el) => {
                          if (el) {
                            focusedRefs.current.set(globalIndex, el);
                            if (isActive) {
                              (activeRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                            }
                          } else {
                            focusedRefs.current.delete(globalIndex);
                          }
                        }}
                        onClick={() => onNoteSpanClick(span)}
                        onHover={onNoteSpanHover}
                        onStartEditing={onStartEditing}
                        onCancelEditing={onCancelEditing}
                        onSaveEdit={onSaveEdit}
                      />
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer with keyboard hints */}
      <div className="border-t border-border/30 bg-muted/20 px-4 py-2.5">
        <p className="text-center text-xs text-muted-foreground">
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            ↑↓
          </kbd>{" "}
          Navigate{" "}
          <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          Select{" "}
          <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Esc
          </kbd>{" "}
          Clear
        </p>
      </div>
    </div>
  );
}

// Individual note span component
interface NoteSpanItemProps {
  span: NoteSpan;
  isActive: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isEditing: boolean;
  isReadOnly: boolean;
  onClick: () => void;
  onHover: (noteSpanId: string | null) => void;
  onStartEditing: (noteSpanId: string) => void;
  onCancelEditing: () => void;
  onSaveEdit: (noteSpanId: string, newText: string) => void;
}

const NoteSpanItem = React.forwardRef<HTMLDivElement, NoteSpanItemProps>(
  (
    {
      span,
      isActive,
      isHovered,
      isFocused,
      isEditing,
      isReadOnly,
      onClick,
      onHover,
      onStartEditing,
      onCancelEditing,
      onSaveEdit,
    },
    ref
  ) => {
    const [editText, setEditText] = useState(span.text);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const hasCitations = span.citations.length > 0;

    useEffect(() => {
      if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, [isEditing]);

    useEffect(() => {
      setEditText(span.text);
    }, [span.text]);

    const handleSave = () => {
      if (editText.trim() !== span.text) {
        onSaveEdit(span.id, editText.trim());
      } else {
        onCancelEditing();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setEditText(span.text);
        onCancelEditing();
      }
    };

    if (isEditing) {
      return (
        <div
          ref={ref}
          className="rounded-lg border-2 border-primary/50 bg-white p-3 shadow-lg"
        >
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none rounded-md border-0 bg-transparent p-0 text-sm leading-relaxed focus:outline-none focus:ring-0"
            rows={3}
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                ⌘Enter
              </kbd>{" "}
              to save
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditText(span.text);
                  onCancelEditing();
                }}
                className="h-7 px-2"
              >
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-7 px-2"
              >
                <Check className="mr-1 h-3 w-3" />
                Save
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group relative rounded-lg p-3 transition-all duration-200 cursor-pointer",
          "border border-transparent",
          span.needsConfirmation && [
            "bg-warning/30 border-warning/50",
            "hover:bg-warning/40",
          ],
          !span.needsConfirmation &&
            isActive && [
              "bg-citation-muted border-citation/40",
              "ring-2 ring-citation/30 ring-offset-1",
              "shadow-md",
            ],
          !span.needsConfirmation &&
            !isActive &&
            (isHovered || isFocused) && ["bg-white/80 border-border/50 shadow-sm"],
          !span.needsConfirmation &&
            !isActive &&
            !isHovered &&
            !isFocused && ["bg-white/50 hover:bg-white/80"]
        )}
        onClick={onClick}
        onMouseEnter={() => onHover(span.id)}
        onMouseLeave={() => onHover(null)}
        role="button"
        tabIndex={0}
        aria-label={`${span.needsConfirmation ? "Needs confirmation: " : ""}${span.text}`}
        aria-pressed={isActive}
      >
        <div className="flex items-start gap-2">
          {/* Status indicator */}
          {span.needsConfirmation ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          ) : hasCitations ? (
            <Link2
              className={cn(
                "mt-0.5 h-4 w-4 flex-shrink-0 transition-colors",
                isActive ? "text-citation" : "text-muted-foreground"
              )}
            />
          ) : (
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
          )}

          {/* Text content */}
          <p
            className={cn(
              "flex-1 text-sm leading-relaxed",
              span.needsConfirmation && "text-amber-900",
              !span.needsConfirmation && isActive && "text-foreground font-medium",
              !span.needsConfirmation && !isActive && "text-foreground/80"
            )}
          >
            {span.text}
          </p>

          {/* Edit button */}
          {!isReadOnly && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onStartEditing(span.id);
              }}
              className={cn(
                "h-7 w-7 flex-shrink-0 opacity-0 transition-opacity",
                "group-hover:opacity-100",
                isActive && "opacity-100"
              )}
              aria-label="Edit note"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Citation count badge */}
        {hasCitations && !span.needsConfirmation && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wider",
                isActive ? "text-citation" : "text-muted-foreground"
              )}
            >
              {span.citations.length} source
              {span.citations.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Needs confirmation label */}
        {span.needsConfirmation && (
          <div className="mt-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
              Needs Confirmation — No supporting evidence
            </span>
          </div>
        )}
      </div>
    );
  }
);

NoteSpanItem.displayName = "NoteSpanItem";
