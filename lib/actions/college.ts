"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { subjectSchema, assignmentSchema, type SubjectFormInput, type AssignmentFormInput } from "@/lib/validations/college";

export async function createSubject(input: SubjectFormInput) {
  const data = subjectSchema.parse(input);
  const subject = await db.subject.create({
    data: {
      name: data.name,
      code: data.code || undefined,
      credits: data.credits,
      facultyName: data.facultyName || undefined,
      minAttendancePct: data.minAttendancePct ?? 75,
      examDate: data.examDate ? new Date(data.examDate) : undefined,
      internalMarks: data.internalMarks,
    },
  });
  revalidatePath("/leads/college");
  redirect(`/leads/college/${subject.id}`);
}

export async function updateSubject(id: string, input: SubjectFormInput) {
  const data = subjectSchema.parse(input);
  await db.subject.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code || null,
      credits: data.credits,
      facultyName: data.facultyName || null,
      minAttendancePct: data.minAttendancePct ?? 75,
      examDate: data.examDate ? new Date(data.examDate) : null,
      internalMarks: data.internalMarks,
    },
  });
  revalidatePath(`/leads/college/${id}`);
  revalidatePath("/leads/college");
}

export async function deleteSubject(id: string) {
  await db.subject.delete({ where: { id } });
  revalidatePath("/leads/college");
  redirect("/leads/college");
}

export async function markAttendance(subjectId: string, mark: "PRESENT" | "ABSENT" | "CANCELLED") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.$transaction(async (tx) => {
    await tx.attendanceEntry.upsert({
      where: { subjectId_date: { subjectId, date: today } },
      create: { subjectId, date: today, mark },
      update: { mark },
    });

    const entries = await tx.attendanceEntry.findMany({ where: { subjectId } });
    const total = entries.filter((e) => e.mark !== "CANCELLED").length;
    const attended = entries.filter((e) => e.mark === "PRESENT").length;

    await tx.subject.update({ where: { id: subjectId }, data: { totalClasses: total, attendedClasses: attended } });
  });

  revalidatePath(`/leads/college/${subjectId}`);
  revalidatePath("/leads/college");
}

export async function createAssignment(subjectId: string, input: AssignmentFormInput) {
  const data = assignmentSchema.parse(input);
  await db.assignment.create({
    data: {
      subjectId,
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: data.status,
      grade: data.grade || undefined,
      notes: data.notes || undefined,
    },
  });
  revalidatePath(`/leads/college/${subjectId}`);
}

export async function updateAssignmentStatus(id: string, subjectId: string, status: "PENDING" | "SUBMITTED" | "GRADED" | "OVERDUE") {
  await db.assignment.update({ where: { id }, data: { status } });
  revalidatePath(`/leads/college/${subjectId}`);
}
