"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { subjectFormSchema, type SubjectFormInput } from "@/lib/validations/college";
import { createSubject, updateSubject, deleteSubject } from "@/lib/actions/college";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const DEFAULTS: SubjectFormInput = {
  name: "",
  code: "",
  credits: "",
  facultyName: "",
  minAttendancePct: "75",
  examDate: "",
  internalMarks: "",
};

export default function SubjectForm({ id, subject }: { id?: string; subject?: SubjectFormInput }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(id);

  const form = useForm<SubjectFormInput>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: subject ?? DEFAULTS,
  });

  async function onSubmit(values: SubjectFormInput) {
    setError(null);
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateSubject(id, values);
        toast.success("Subject updated");
        router.refresh();
      } else {
        await createSubject(values);
      }
    } catch (e) {
      if (e instanceof Error && e.message !== "NEXT_REDIRECT") setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id || !confirm("Delete this subject and all its attendance/assignment history?")) return;
    await deleteSubject(id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={isEdit ? "card-glow relative z-10 space-y-4" : "space-y-4"}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="facultyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faculty</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credits</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="minAttendancePct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min attendance %</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="examDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="internalMarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal marks</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create Subject"}
          </Button>
          {isEdit && (
            <Button type="button" variant="ghost" className="text-destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
