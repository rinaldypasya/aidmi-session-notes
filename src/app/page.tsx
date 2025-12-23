import { prisma } from "@/lib/prisma";
import { SessionDetail } from "@/components/session/SessionDetail";
import type { Session, TranscriptSegment, NoteSpan } from "@/types";

async function getSession(): Promise<Session | null> {
  try {
    const session = await prisma.session.findFirst({
      include: {
        transcriptSegments: {
          orderBy: { order: "asc" },
        },
        noteSpans: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!session) return null;

    // Transform data to match our types
    return {
      id: session.id,
      patientName: session.patientName,
      clinicianName: session.clinicianName,
      sessionDate: session.sessionDate,
      duration: session.duration,
      status: session.status as "draft" | "signed",
      signedAt: session.signedAt,
      transcriptSegments: session.transcriptSegments.map((seg) => ({
        id: seg.id,
        speaker: seg.speaker as "clinician" | "patient",
        text: seg.text,
        startMs: seg.startMs,
        endMs: seg.endMs,
        order: seg.order,
      })) as TranscriptSegment[],
      noteSpans: session.noteSpans.map((span) => ({
        id: span.id,
        section: span.section as "subjective" | "objective" | "assessment" | "plan",
        text: span.text,
        citations: JSON.parse(span.citations) as string[],
        needsConfirmation: span.needsConfirmation,
        order: span.order,
      })) as NoteSpan[],
    };
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            No Session Found
          </h1>
          <p className="text-muted-foreground mb-6">
            Please run the database seed to create sample data.
          </p>
          <code className="rounded-lg bg-muted px-4 py-2 font-mono text-sm">
            npm run db:seed
          </code>
        </div>
      </div>
    );
  }

  return <SessionDetail initialSession={session} />;
}
