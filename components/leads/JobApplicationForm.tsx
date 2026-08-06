"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  jobApplicationFormSchema,
  type JobApplicationFormInput,
  JOB_APPLICATION_STATUSES,
  JOB_STATUS_LABELS,
} from "@/lib/validations/jobs";
import { createJobApplication, updateJobApplication, deleteJobApplication } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type ResumeOption = { id: string; name: string };

const DEFAULTS: JobApplicationFormInput = {
  company: "",
  role: "",
  packageOffered: "",
  location: "",
  jdUrl: "",
  status: "SAVED",
  resumeId: "",
  appliedAt: "",
  notes: "",
};

export default function JobApplicationForm({
  id,
  job,
  resumes,
}: {
  id?: string;
  job?: JobApplicationFormInput;
  resumes: ResumeOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(id);

  const form = useForm<JobApplicationFormInput>({
    resolver: zodResolver(jobApplicationFormSchema),
    defaultValues: job ?? DEFAULTS,
  });

  async function onSubmit(values: JobApplicationFormInput) {
    setError(null);
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateJobApplication(id, values);
        toast.success("Application updated");
        router.refresh();
      } else {
        await createJobApplication(values);
      }
    } catch (e) {
      if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
        setError(e.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id || !confirm("Delete this application?")) return;
    await deleteJobApplication(id);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={isEdit ? "card-glow relative z-10 space-y-4" : "space-y-4"}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
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
            name="packageOffered"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 12 LPA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="jdUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job description URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {JOB_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {resumes.length > 0 && (
            <FormField
              control={form.control}
              name="resumeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume used</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resumes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <FormField
          control={form.control}
          name="appliedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Applied on</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create Application"}
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
