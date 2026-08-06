"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientInput, CLIENT_STATUSES } from "@/lib/validations/clients";
import { createClientRecord } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type WonLead = { id: string; company: string; leadNumber: number };

export default function NewClientForm({ wonLeads }: { wonLeads: WonLead[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", company: "", email: "", phone: "", status: "ACTIVE", leadId: "", notes: "" },
  });

  async function onSubmit(values: ClientInput) {
    setError(null);
    setSubmitting(true);
    try {
      await createClientRecord(values);
    } catch (e) {
      if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
        setError(e.message);
        setSubmitting(false);
      }
    }
  }

  function selectLead(leadId: string) {
    const lead = wonLeads.find((l) => l.id === leadId);
    if (lead) {
      form.setValue("leadId", leadId);
      if (!form.getValues("name")) form.setValue("name", lead.company);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {wonLeads.length > 0 && (
          <div>
            <label className="text-sm font-medium">Link a won lead (optional)</label>
            <Select onValueChange={selectLead}>
              <SelectTrigger>
                <SelectValue placeholder="Select a won lead…" />
              </SelectTrigger>
              <SelectContent>
                {wonLeads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    #{l.leadNumber} · {l.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
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
            name="email"
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CLIENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
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
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Create Client"}
        </Button>
      </form>
    </Form>
  );
}
