import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.noteSpan.deleteMany();
  await prisma.transcriptSegment.deleteMany();
  await prisma.session.deleteMany();

  // Create a session
  const session = await prisma.session.create({
    data: {
      id: "session-001",
      patientName: "Sarah M.",
      clinicianName: "Dr. Emily Chen",
      sessionDate: new Date("2024-11-15T10:00:00Z"),
      duration: 2700000, // 45 minutes
      status: "draft",
    },
  });

  // Create transcript segments with realistic behavioral health content
  const transcriptSegments = [
    {
      id: "ts-001",
      sessionId: session.id,
      speaker: "clinician",
      text: "Good morning, Sarah. How have you been feeling since our last session two weeks ago?",
      startMs: 0,
      endMs: 5000,
      order: 1,
    },
    {
      id: "ts-002",
      sessionId: session.id,
      speaker: "patient",
      text: "Hi Dr. Chen. It's been a mixed bag, honestly. The first week was really tough. I had trouble sleeping most nights, maybe getting only 3-4 hours. But this past week has been a bit better.",
      startMs: 5500,
      endMs: 18000,
      order: 2,
    },
    {
      id: "ts-003",
      sessionId: session.id,
      speaker: "clinician",
      text: "I'm glad to hear there's been some improvement. Can you tell me more about what was making it difficult to sleep that first week?",
      startMs: 19000,
      endMs: 26000,
      order: 3,
    },
    {
      id: "ts-004",
      sessionId: session.id,
      speaker: "patient",
      text: "It was the racing thoughts again. I kept replaying conversations from work, worrying about the presentation I have coming up. My mind just wouldn't shut off. I tried the breathing exercises you taught me, and they helped a little, but some nights I still couldn't fall asleep until 3 or 4 AM.",
      startMs: 27000,
      endMs: 48000,
      order: 4,
    },
    {
      id: "ts-005",
      sessionId: session.id,
      speaker: "clinician",
      text: "It sounds like work-related anxiety is still a significant trigger for you. Have you been able to identify any patterns in when these thoughts are most intense?",
      startMs: 49000,
      endMs: 58000,
      order: 5,
    },
    {
      id: "ts-006",
      sessionId: session.id,
      speaker: "patient",
      text: "Yes, definitely Sunday evenings are the worst. The anticipation of the work week just floods in. And then Wednesday too, because that's when we have team meetings, and my manager has been pretty critical lately.",
      startMs: 59000,
      endMs: 73000,
      order: 6,
    },
    {
      id: "ts-007",
      sessionId: session.id,
      speaker: "clinician",
      text: "That's a valuable insight. How are things going with the medication adjustment we made last time? Any side effects from increasing the sertraline to 100mg?",
      startMs: 74000,
      endMs: 84000,
      order: 7,
    },
    {
      id: "ts-008",
      sessionId: session.id,
      speaker: "patient",
      text: "The first few days I felt a bit nauseous in the mornings, but that went away. I think I'm starting to notice some improvement in my overall mood. The lows don't feel quite as low, if that makes sense. I haven't had any of those really dark days this past week.",
      startMs: 85000,
      endMs: 104000,
      order: 8,
    },
    {
      id: "ts-009",
      sessionId: session.id,
      speaker: "clinician",
      text: "That's encouraging progress. The fact that the nausea resolved and you're noticing mood stabilization suggests the increased dose is working. Have you had any thoughts of self-harm or suicide?",
      startMs: 105000,
      endMs: 116000,
      order: 9,
    },
    {
      id: "ts-010",
      sessionId: session.id,
      speaker: "patient",
      text: "No, nothing like that. Even during the bad week, I didn't have those thoughts. I think the worst it got was feeling like I wanted to just disappear from work for a while, but not in a harmful way. More like needing a long vacation.",
      startMs: 117000,
      endMs: 133000,
      order: 10,
    },
    {
      id: "ts-011",
      sessionId: session.id,
      speaker: "clinician",
      text: "I'm glad to hear that. Have you been able to maintain any of the self-care activities we discussed? Exercise, spending time outdoors?",
      startMs: 134000,
      endMs: 142000,
      order: 11,
    },
    {
      id: "ts-012",
      sessionId: session.id,
      speaker: "patient",
      text: "I went for walks three times this week, which is more than usual. My sister actually joined me on Sunday, which was nice. Having company made it easier to get out of the house. I haven't been to the gym though.",
      startMs: 143000,
      endMs: 159000,
      order: 12,
    },
    {
      id: "ts-013",
      sessionId: session.id,
      speaker: "clinician",
      text: "Walking with your sister sounds like a positive step. Social support is so important. How has your appetite been?",
      startMs: 160000,
      endMs: 168000,
      order: 13,
    },
    {
      id: "ts-014",
      sessionId: session.id,
      speaker: "patient",
      text: "Better than before. I'm eating three meals most days now. I still don't have much appetite in the mornings, but I force myself to have at least some toast or yogurt.",
      startMs: 169000,
      endMs: 182000,
      order: 14,
    },
    {
      id: "ts-015",
      sessionId: session.id,
      speaker: "clinician",
      text: "Let's talk about strategies for managing the Sunday evening anxiety. What do you currently do on Sunday evenings?",
      startMs: 183000,
      endMs: 192000,
      order: 15,
    },
    {
      id: "ts-016",
      sessionId: session.id,
      speaker: "patient",
      text: "Usually I end up just scrolling on my phone, reading work emails, trying to get ahead. But then I get more anxious because I see all these things I need to do.",
      startMs: 193000,
      endMs: 206000,
      order: 16,
    },
  ];

  for (const segment of transcriptSegments) {
    await prisma.transcriptSegment.create({ data: segment });
  }

  // Create note spans with citations - realistic SOAP format
  const noteSpans = [
    // Subjective section
    {
      id: "ns-001",
      sessionId: session.id,
      section: "subjective",
      text: "Patient reports mixed progress over the past two weeks, with significant sleep difficulties during the first week (3-4 hours per night) followed by improvement in the second week.",
      citations: JSON.stringify(["ts-002"]),
      needsConfirmation: false,
      order: 1,
    },
    {
      id: "ns-002",
      sessionId: session.id,
      section: "subjective",
      text: "Sleep disturbance attributed to racing thoughts and work-related anxiety, particularly concerns about an upcoming presentation. Patient utilized breathing exercises with partial effectiveness.",
      citations: JSON.stringify(["ts-004"]),
      needsConfirmation: false,
      order: 2,
    },
    {
      id: "ns-003",
      sessionId: session.id,
      section: "subjective",
      text: "Anxiety patterns identified: Sunday evenings (anticipatory anxiety about work week) and Wednesdays (team meetings with critical manager).",
      citations: JSON.stringify(["ts-006"]),
      needsConfirmation: false,
      order: 3,
    },
    {
      id: "ns-004",
      sessionId: session.id,
      section: "subjective",
      text: "Patient denies suicidal ideation or thoughts of self-harm. Reports passive desire to 'disappear from work' but clarifies this as desire for respite rather than harmful intent.",
      citations: JSON.stringify(["ts-010"]),
      needsConfirmation: false,
      order: 4,
    },
    // Objective section
    {
      id: "ns-005",
      sessionId: session.id,
      section: "objective",
      text: "Medication status: Sertraline increased to 100mg at previous session. Initial side effect of morning nausea resolved within first few days.",
      citations: JSON.stringify(["ts-008"]),
      needsConfirmation: false,
      order: 5,
    },
    {
      id: "ns-006",
      sessionId: session.id,
      section: "objective",
      text: "Patient appears engaged and maintains good eye contact throughout session. Affect is congruent with reported mood improvements.",
      citations: JSON.stringify([]),
      needsConfirmation: true,
      order: 6,
    },
    {
      id: "ns-007",
      sessionId: session.id,
      section: "objective",
      text: "Behavioral interventions: Patient engaged in walking 3 times per week, including one social outing with sister. Gym attendance not maintained.",
      citations: JSON.stringify(["ts-012"]),
      needsConfirmation: false,
      order: 7,
    },
    {
      id: "ns-008",
      sessionId: session.id,
      section: "objective",
      text: "Appetite improved with patient eating three meals daily. Morning appetite remains reduced but patient demonstrates compensatory behavior.",
      citations: JSON.stringify(["ts-014"]),
      needsConfirmation: false,
      order: 8,
    },
    // Assessment section
    {
      id: "ns-009",
      sessionId: session.id,
      section: "assessment",
      text: "Major Depressive Disorder, recurrent, moderate - showing improvement. Patient reports decreased severity of depressive episodes ('lows don't feel quite as low') and absence of very dark days.",
      citations: JSON.stringify(["ts-008"]),
      needsConfirmation: false,
      order: 9,
    },
    {
      id: "ns-010",
      sessionId: session.id,
      section: "assessment",
      text: "Generalized Anxiety Disorder with work-related triggers. Anxiety remains clinically significant but patient demonstrating improved coping strategies.",
      citations: JSON.stringify(["ts-004", "ts-006"]),
      needsConfirmation: false,
      order: 10,
    },
    {
      id: "ns-011",
      sessionId: session.id,
      section: "assessment",
      text: "PHQ-9 score estimated to have decreased by 3 points since last session based on symptom presentation.",
      citations: JSON.stringify([]),
      needsConfirmation: true,
      order: 11,
    },
    // Plan section
    {
      id: "ns-012",
      sessionId: session.id,
      section: "plan",
      text: "Continue sertraline 100mg daily. Monitor for continued mood stabilization and any emerging side effects.",
      citations: JSON.stringify(["ts-008", "ts-009"]),
      needsConfirmation: false,
      order: 12,
    },
    {
      id: "ns-013",
      sessionId: session.id,
      section: "plan",
      text: "Implement Sunday evening anxiety management protocol: No work email after 6 PM, structured relaxation activity, sleep hygiene reinforcement.",
      citations: JSON.stringify(["ts-015", "ts-016"]),
      needsConfirmation: false,
      order: 13,
    },
    {
      id: "ns-014",
      sessionId: session.id,
      section: "plan",
      text: "Encourage continued walking routine with social component. Discuss gradual return to gym at next session.",
      citations: JSON.stringify(["ts-012"]),
      needsConfirmation: false,
      order: 14,
    },
    {
      id: "ns-015",
      sessionId: session.id,
      section: "plan",
      text: "Follow-up appointment scheduled in two weeks. Patient to contact clinic if sleep disturbance worsens or if any concerning symptoms emerge.",
      citations: JSON.stringify([]),
      needsConfirmation: true,
      order: 15,
    },
  ];

  for (const span of noteSpans) {
    await prisma.noteSpan.create({ data: span });
  }

  console.log("✅ Database seeded successfully!");
  console.log(`   - Created session: ${session.id}`);
  console.log(`   - Created ${transcriptSegments.length} transcript segments`);
  console.log(`   - Created ${noteSpans.length} note spans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
