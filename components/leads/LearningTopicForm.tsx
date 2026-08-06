"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { topicFormSchema, type TopicFormInput, LEARNING_STATUSES } from "@/lib/validations/learning";
import { updateTopic, markRevised } from "@/lib/actions/learning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function LearningTopicForm({ id, topic, lastRevisedAt }: { id: string; topic: TopicFormInput; lastRevisedAt: string | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useForm<TopicFormInput>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: topic,
  });

  async function onSubmit(values: TopicFormInput) {
    setSaving(true);
    try {
      await updateTopic(id, values);
      toast.success("Topic updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function onMarkRevised() {
    await markRevised(id);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="card-glow relative z-10 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEARNING_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="completionPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completion %</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <div className="text-xs text-muted-foreground">
            {lastRevisedAt ? `Last revised ${new Date(lastRevisedAt).toLocaleDateString()}` : "Never revised"} ·{" "}
            <button type="button" onClick={onMarkRevised} className="underline">
              Mark revised today
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}
