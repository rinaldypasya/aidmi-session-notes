"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { TranscriptSegment, NoteSpan } from "@/types";

interface UseSessionStateProps {
  noteSpans: NoteSpan[];
}

export function useSessionState({
  noteSpans: initialNoteSpans,
}: UseSessionStateProps) {
  // Active selections
  const [activeNoteSpanId, setActiveNoteSpanId] = useState<string | null>(null);
  const [activeTranscriptIds, setActiveTranscriptIds] = useState<Set<string>>(
    new Set()
  );
  const [hoveredNoteSpanId, setHoveredNoteSpanId] = useState<string | null>(
    null
  );
  const [hoveredTranscriptId, setHoveredTranscriptId] = useState<string | null>(
    null
  );

  // Edit mode state
  const [editingNoteSpanId, setEditingNoteSpanId] = useState<string | null>(
    null
  );
  const [noteSpans, setNoteSpans] = useState<NoteSpan[]>(initialNoteSpans);

  // Keyboard navigation state
  const [focusedNoteIndex, setFocusedNoteIndex] = useState<number>(-1);

  // Build reverse citation map: transcript ID -> note span IDs that cite it
  const transcriptToCitations = useMemo(() => {
    const map = new Map<string, Set<string>>();
    noteSpans.forEach((span) => {
      span.citations.forEach((citationId) => {
        if (!map.has(citationId)) {
          map.set(citationId, new Set());
        }
        map.get(citationId)!.add(span.id);
      });
    });
    return map;
  }, [noteSpans]);

  // Handle note span click - highlight corresponding transcript segments
  const handleNoteSpanClick = useCallback(
    (noteSpan: NoteSpan) => {
      if (activeNoteSpanId === noteSpan.id) {
        // Deselect if clicking the same span
        setActiveNoteSpanId(null);
        setActiveTranscriptIds(new Set());
      } else {
        setActiveNoteSpanId(noteSpan.id);
        setActiveTranscriptIds(new Set(noteSpan.citations));
      }
    },
    [activeNoteSpanId]
  );

  // Handle transcript segment click - highlight which notes cite it (bidirectional)
  const handleTranscriptClick = useCallback(
    (segment: TranscriptSegment) => {
      const citingNoteIds = transcriptToCitations.get(segment.id);
      if (citingNoteIds && citingNoteIds.size > 0) {
        // Find the first citing note span
        const firstCitingId = Array.from(citingNoteIds)[0];
        const noteSpan = noteSpans.find((ns) => ns.id === firstCitingId);
        if (noteSpan) {
          setActiveNoteSpanId(firstCitingId);
          setActiveTranscriptIds(new Set(noteSpan.citations));
        }
      }
    },
    [transcriptToCitations, noteSpans]
  );

  // Handle note span hover
  const handleNoteSpanHover = useCallback((noteSpanId: string | null) => {
    setHoveredNoteSpanId(noteSpanId);
  }, []);

  // Handle transcript segment hover
  const handleTranscriptHover = useCallback((segmentId: string | null) => {
    setHoveredTranscriptId(segmentId);
  }, []);

  // Edit mode handlers
  const startEditing = useCallback((noteSpanId: string) => {
    setEditingNoteSpanId(noteSpanId);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingNoteSpanId(null);
  }, []);

  const saveEdit = useCallback(
    async (noteSpanId: string, newText: string) => {
      // Optimistically update local state
      setNoteSpans((prev) =>
        prev.map((span) =>
          span.id === noteSpanId ? { ...span, text: newText } : span
        )
      );
      setEditingNoteSpanId(null);

      // Persist to database
      try {
        const response = await fetch(`/api/sessions/note-spans/${noteSpanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText }),
        });

        if (!response.ok) {
          throw new Error("Failed to save edit");
        }
      } catch (error) {
        console.error("Failed to save note span edit:", error);
        // Revert on failure
        setNoteSpans(initialNoteSpans);
      }
    },
    [initialNoteSpans]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault();
          setFocusedNoteIndex((prev) =>
            prev < noteSpans.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          setFocusedNoteIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedNoteIndex >= 0 && focusedNoteIndex < noteSpans.length) {
            handleNoteSpanClick(noteSpans[focusedNoteIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setActiveNoteSpanId(null);
          setActiveTranscriptIds(new Set());
          setFocusedNoteIndex(-1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedNoteIndex, noteSpans, handleNoteSpanClick]);

  // Clear selection when clicking outside
  const clearSelection = useCallback(() => {
    setActiveNoteSpanId(null);
    setActiveTranscriptIds(new Set());
    setFocusedNoteIndex(-1);
  }, []);

  return {
    // State
    activeNoteSpanId,
    activeTranscriptIds,
    hoveredNoteSpanId,
    hoveredTranscriptId,
    editingNoteSpanId,
    noteSpans,
    focusedNoteIndex,
    transcriptToCitations,

    // Handlers
    handleNoteSpanClick,
    handleTranscriptClick,
    handleNoteSpanHover,
    handleTranscriptHover,
    startEditing,
    cancelEditing,
    saveEdit,
    clearSelection,
    setFocusedNoteIndex,
  };
}
