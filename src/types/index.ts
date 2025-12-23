export interface TranscriptSegment {
  id: string;
  speaker: "clinician" | "patient";
  text: string;
  startMs: number;
  endMs: number;
  order: number;
}

export interface NoteSpan {
  id: string;
  section: "subjective" | "objective" | "assessment" | "plan";
  text: string;
  citations: string[];
  needsConfirmation: boolean;
  order: number;
}

export interface Session {
  id: string;
  patientName: string;
  clinicianName: string;
  sessionDate: Date;
  duration: number;
  status: "draft" | "signed";
  signedAt: Date | null;
  transcriptSegments: TranscriptSegment[];
  noteSpans: NoteSpan[];
}

export type SOAPSection = "subjective" | "objective" | "assessment" | "plan";

export const SOAP_SECTIONS: SOAPSection[] = [
  "subjective",
  "objective",
  "assessment",
  "plan",
];

export const SOAP_LABELS: Record<SOAPSection, string> = {
  subjective: "Subjective",
  objective: "Objective",
  assessment: "Assessment",
  plan: "Plan",
};

export const SOAP_DESCRIPTIONS: Record<SOAPSection, string> = {
  subjective: "Patient's reported symptoms and history",
  objective: "Observable and measurable findings",
  assessment: "Clinical interpretation and diagnosis",
  plan: "Treatment recommendations and next steps",
};
