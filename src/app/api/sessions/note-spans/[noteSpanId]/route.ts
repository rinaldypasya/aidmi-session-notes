import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { noteSpanId: string } }
) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid text provided" },
        { status: 400 }
      );
    }

    const noteSpan = await prisma.noteSpan.findUnique({
      where: { id: params.noteSpanId },
    });

    if (!noteSpan) {
      return NextResponse.json(
        { error: "Note span not found" },
        { status: 404 }
      );
    }

    const updatedNoteSpan = await prisma.noteSpan.update({
      where: { id: params.noteSpanId },
      data: { text },
    });

    return NextResponse.json({
      ...updatedNoteSpan,
      citations: JSON.parse(updatedNoteSpan.citations),
    });
  } catch (error) {
    console.error("Error updating note span:", error);
    return NextResponse.json(
      { error: "Failed to update note span" },
      { status: 500 }
    );
  }
}
