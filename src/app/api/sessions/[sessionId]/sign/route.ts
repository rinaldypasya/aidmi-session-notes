import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status === "signed") {
      return NextResponse.json(
        { error: "Session is already signed" },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        status: "signed",
        signedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error signing session:", error);
    return NextResponse.json(
      { error: "Failed to sign session" },
      { status: 500 }
    );
  }
}
