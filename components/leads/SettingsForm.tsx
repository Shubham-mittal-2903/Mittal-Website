"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";
import { saveSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initial,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "portfolioLinks" });

  async function onSubmit(values: SettingsInput) {
    setSaving(true);
    try {
      await saveSettings(values);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="card-glow relative z-10 space-y-4">
          <h3 className="text-sm font-semibold">Profile</h3>
          <FormField
            control={form.control}
            name="profileName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profileEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="card-glow relative z-10 space-y-4">
          <h3 className="text-sm font-semibold">Email Signature</h3>
          <FormField
            control={form.control}
            name="emailSignature"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea rows={5} placeholder="Shubham Mittal&#10;Founder, MITTAL.WEBSITE&#10;+91 77019 03505" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="card-glow relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Portfolio Links</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ url: "", label: "", useCase: "" })}
            >
              <Plus size={14} />
              Add Link
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No portfolio links yet.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <Input placeholder="Label" {...form.register(`portfolioLinks.${index}.label`)} />
                  <Input placeholder="https://…" {...form.register(`portfolioLinks.${index}.url`)} />
                  <Input placeholder="Use case" {...form.register(`portfolioLinks.${index}.useCase`)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}
