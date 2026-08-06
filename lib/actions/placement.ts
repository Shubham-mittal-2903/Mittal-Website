"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Extracted directly from the two source PDFs in Desktop/RESUME — BNP_7Day_Prep_Plan.pdf
// (day-by-day schedule) and BNP_Prep_Resources.pdf (exact study links per day). Re-running
// this is a no-op once the roadmap exists; it never overwrites topic/target status the user
// has already set, since those live in separate rows this only creates once.
const SOURCE_DOCS = "BNP_7Day_Prep_Plan.pdf, BNP_Prep_Resources.pdf";
const ROADMAP_TITLE = "BNP Paribas — 7-Day Prep Sprint";

const MILESTONES: Array<{ title: string; dueDate: string }> = [
  { title: "Day 1 — Arrays, Strings + OWASP basics", dueDate: "2026-08-06" },
  { title: "Day 2 — Binary Search & Sorting", dueDate: "2026-08-07" },
  { title: "Day 3 — Linked List, Stack, Queue", dueDate: "2026-08-08" },
  { title: "Day 4 — Trees + Recursion/Backtracking", dueDate: "2026-08-09" },
  { title: "Day 5 — Graphs + DP intro", dueDate: "2026-08-10" },
  { title: "Day 6 — DP patterns + weak-topic cleanup + mock", dueDate: "2026-08-11" },
  { title: "Day 7 — Full revision + rest + resume prep", dueDate: "2026-08-12" },
  { title: "Interview mode begins", dueDate: "2026-08-13" },
];

const TOPICS: Array<{ title: string; category: string; resources: Array<{ label: string; url: string | null }>; notes?: string }> = [
  {
    title: "Arrays & Strings",
    category: "DSA",
    resources: [
      { label: "Striver A2Z — Array & String sections", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2" },
      { label: "GeeksforGeeks Practice (backup, pattern-specific)", url: "https://practice.geeksforgeeks.org" },
    ],
    notes: "Revise two-pointer, sliding window, prefix sum. Solve 12–15 easy/medium problems — speed over new concepts.",
  },
  {
    title: "OWASP Top 10",
    category: "Security",
    resources: [
      { label: "OWASP Top 10 Vulnerabilities Explained (Hindi)", url: null },
      { label: "OWASP Top 10 2025 — What Changed (optional add-on)", url: null },
    ],
    notes: "One Hindi walkthrough is enough for interview-level awareness — no deep memorization needed.",
  },
  {
    title: "Binary Search & Sorting",
    category: "DSA",
    resources: [{ label: "Striver A2Z — Binary Search & Sorting sections", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2" }],
    notes: "Do all 'variations' sub-problems — that's what shows up in OAs. Solve 10–12 problems, timed under 20 min each.",
  },
  {
    title: "Linked List, Stack, Queue",
    category: "DSA",
    resources: [
      { label: "Striver A2Z — Linked List + Stack/Queue sections", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2" },
      { label: "Pepcoding (backup, Hindi explanations)", url: null },
    ],
    notes: "Prioritize reverse linked list variants, cycle detection, valid parentheses, next greater element. Common OA topic for bank/finance hiring.",
  },
  {
    title: "Trees + Recursion/Backtracking",
    category: "DSA",
    resources: [{ label: "Striver A2Z — Binary Trees + Recursion sections", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2" }],
    notes: "Traversals, BST ops, height/diameter/LCA. Recursion: just the intro sub-section this week.",
  },
  {
    title: "Graphs (BFS/DFS basics)",
    category: "DSA",
    resources: [{ label: "Striver A2Z — Graph section (BFS/DFS + basics only)", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2" }],
    notes: "Stop at basic traversal + connected components — shortest path algorithms aren't worth the time this week.",
  },
  {
    title: "Dynamic Programming",
    category: "DSA",
    resources: [{ label: "Aditya Verma — Dynamic Programming playlist", url: null }],
    notes: "Follow recursion → memoization → tabulation order exactly. Day 5: intro + knapsack recursion. Day 6: knapsack variants + LCS.",
  },
  {
    title: "RAG (optional)",
    category: "AI",
    resources: [{ label: "RAG Tutorial 2026 — Complete Introduction to RAG", url: null }],
    notes: "Bonus only, Day 5, if ahead of schedule. Skip entirely if DSA isn't solid — DSA wins every time this week.",
  },
  {
    title: "Project Storytelling",
    category: "Interview Prep",
    resources: [],
    notes: "Practice explaining Mittal Digital, ClearMyChallan, Noqify, JAYDEN in under 90 seconds each — mirror or recorded.",
  },
  {
    title: "Resume + Self-Intro Prep",
    category: "Interview Prep",
    resources: [],
    notes: "Read through both resume versions once more. Prepare a clean 60-second self-intro: B.Tech + freelance work + Witty Owls internship.",
  },
];

const DAILY_TARGETS: Array<{ date: string; title: string }> = [
  { date: "2026-08-06", title: "Solve 12–15 Array/String problems + OWASP Top 10 overview" },
  { date: "2026-08-07", title: "Binary Search + Sorting — 10–12 timed problems" },
  { date: "2026-08-08", title: "Linked List / Stack / Queue — 10–12 problems" },
  { date: "2026-08-09", title: "Trees + Recursion/Backtracking — 10 problems" },
  { date: "2026-08-10", title: "Graphs (8–10 problems) + DP intro (1–2 problems)" },
  { date: "2026-08-11", title: "DP patterns (6–8 problems) + weak-topic cleanup + mock project pitch" },
  { date: "2026-08-12", title: "Full revision — redo 5–6 problems from memory + resume/story prep" },
];

const WEEKLY_TARGETS: Array<{ date: string; title: string }> = [
  { date: "2026-08-03", title: "Finish DSA revision (Arrays → DP) + OWASP + mock pitch before Aug 13 interview-mode transition" },
];

export async function seedBnpRoadmap() {
  const existing = await db.prepRoadmap.findFirst({ where: { title: ROADMAP_TITLE } });
  if (existing) return existing.id;

  const roadmap = await db.prepRoadmap.create({
    data: {
      title: ROADMAP_TITLE,
      sourceDocument: SOURCE_DOCS,
      startDate: new Date("2026-08-06"),
      targetDate: new Date("2026-08-13"),
      milestones: { create: MILESTONES.map((m, i) => ({ title: m.title, dueDate: new Date(m.dueDate), order: i })) },
      topics: { create: TOPICS.map((t, i) => ({ title: t.title, category: t.category, resources: t.resources, notes: t.notes, order: i })) },
      targets: {
        create: [
          ...DAILY_TARGETS.map((t) => ({ scope: "DAILY" as const, date: new Date(t.date), title: t.title })),
          ...WEEKLY_TARGETS.map((t) => ({ scope: "WEEKLY" as const, date: new Date(t.date), title: t.title })),
        ],
      },
    },
  });
  revalidatePath("/leads/placement-prep");
  return roadmap.id;
}

export async function setTopicStatus(
  id: string,
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "BLOCKED"
) {
  // The status change itself IS the manual approval — nothing in this app ever flips a
  // topic's status without a direct user action, so approvedAt just timestamps that action.
  await db.prepTopic.update({
    where: { id },
    data: { status, approvedAt: new Date() },
  });
  revalidatePath("/leads/placement-prep");
}

export async function toggleTopicWeak(id: string, isWeak: boolean) {
  await db.prepTopic.update({ where: { id }, data: { isWeak } });
  revalidatePath("/leads/placement-prep");
}

export async function updateTopicNotes(id: string, notes: string) {
  await db.prepTopic.update({ where: { id }, data: { notes } });
  revalidatePath("/leads/placement-prep");
}

export async function toggleTarget(id: string, done: boolean) {
  await db.prepTarget.update({ where: { id }, data: { done } });
  revalidatePath("/leads/placement-prep");
}

export async function toggleMilestone(id: string, done: boolean) {
  await db.prepMilestone.update({ where: { id }, data: { completedAt: done ? new Date() : null } });
  revalidatePath("/leads/placement-prep");
}
