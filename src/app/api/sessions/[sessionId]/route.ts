import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        transcriptSegments: {
          orderBy: { order: "asc" },
        },
        noteSpans: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Parse citations from JSON strings
    const formattedSession = {
      ...session,
      noteSpans: session.noteSpans.map((span) => ({
        ...span,
        citations: JSON.parse(span.citations),
      })),
    };

    return NextResponse.json(formattedSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
