"use client";

import React, { useState, useCallback } from "react";
import { useSessionState } from "@/hooks/useSessionState";
import { SessionHeader } from "@/components/session/SessionHeader";
import { TranscriptPanel } from "@/components/session/TranscriptPanel";
import { NotePanel } from "@/components/session/NotePanel";
import type { Session } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";

interface SessionDetailProps {
  initialSession: Session;
}

export function SessionDetail({ initialSession }: SessionDetailProps) {
  const [session, setSession] = useState<Session>(initialSession);

  const {
    activeNoteSpanId,
    activeTranscriptIds,
    hoveredNoteSpanId,
    hoveredTranscriptId,
    editingNoteSpanId,
    noteSpans,
    focusedNoteIndex,
    transcriptToCitations,
    handleNoteSpanClick,
    handleTranscriptClick,
    handleNoteSpanHover,
    handleTranscriptHover,
    startEditing,
    cancelEditing,
    saveEdit,
  } = useSessionState({
    transcriptSegments: session.transcriptSegments,
    noteSpans: session.noteSpans,
  });

  // Count items needing confirmation
  const needsConfirmationCount = noteSpans.filter(
    (span) => span.needsConfirmation
  ).length;

  // Handle sign note
  const handleSignNote = useCallback(async () => {
    const response = await fetch(`/api/sessions/${session.id}/sign`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to sign note");
    }

    const updatedSession = await response.json();
    setSession((prev) => ({
      ...prev,
      status: updatedSession.status,
      signedAt: updatedSession.signedAt,
    }));
  }, [session.id]);

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background">
        {/* Header */}
        <SessionHeader
          session={session}
          needsConfirmationCount={needsConfirmationCount}
          onSignNote={handleSignNote}
        />

        {/* Main content - Split view */}
        <div className="flex flex-1 overflow-hidden">
          {/* Transcript Panel - Left side on desktop, top on mobile */}
          <div className="w-full border-r border-border/50 lg:w-1/2">
            <TranscriptPanel
              segments={session.transcriptSegments}
              activeIds={activeTranscriptIds}
              hoveredId={hoveredTranscriptId}
              citingNoteIds={transcriptToCitations}
              onSegmentClick={handleTranscriptClick}
              onSegmentHover={handleTranscriptHover}
            />
          </div>

          {/* Note Panel - Right side on desktop, bottom on mobile */}
          <div className="hidden w-1/2 lg:block">
            <NotePanel
              noteSpans={noteSpans}
              activeNoteSpanId={activeNoteSpanId}
              hoveredNoteSpanId={hoveredNoteSpanId}
              editingNoteSpanId={editingNoteSpanId}
              focusedNoteIndex={focusedNoteIndex}
              sessionStatus={session.status}
              onNoteSpanClick={handleNoteSpanClick}
              onNoteSpanHover={handleNoteSpanHover}
              onStartEditing={startEditing}
              onCancelEditing={cancelEditing}
              onSaveEdit={saveEdit}
            />
          </div>
        </div>

        {/* Mobile: Note Panel as bottom sheet (simplified for this demo) */}
        <div className="border-t border-border/50 lg:hidden">
          <NotePanel
            noteSpans={noteSpans}
            activeNoteSpanId={activeNoteSpanId}
            hoveredNoteSpanId={hoveredNoteSpanId}
            editingNoteSpanId={editingNoteSpanId}
            focusedNoteIndex={focusedNoteIndex}
            sessionStatus={session.status}
            onNoteSpanClick={handleNoteSpanClick}
            onNoteSpanHover={handleNoteSpanHover}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onSaveEdit={saveEdit}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
