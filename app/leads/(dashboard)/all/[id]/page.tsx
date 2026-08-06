import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LeadOverviewForm from "@/components/leads/LeadOverviewForm";
import LeadPipelineTab from "@/components/leads/LeadPipelineTab";
import AuditTab from "@/components/leads/AuditTab";
import EmailsTab from "@/components/leads/EmailsTab";
import DocumentsTab from "@/components/leads/DocumentsTab";
import { STAGE_LABELS } from "@/lib/validations/leads";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      pipelineEvents: { orderBy: { occurredAt: "desc" } },
      audits: { orderBy: { performedAt: "desc" }, include: { findings: { orderBy: { createdAt: "desc" } } } },
      emailDrafts: { orderBy: { createdAt: "desc" } },
      emailHistory: { orderBy: { date: "desc" } },
      followups: { orderBy: { createdAt: "desc" } },
      attachments: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!lead) notFound();

  const latestAudit = lead.audits[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{lead.company}</h1>
          <Badge variant="secondary">{STAGE_LABELS[lead.status]}</Badge>
          {lead.legacyId && <Badge variant="outline">Migrated · {lead.legacyId}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          Lead #{lead.leadNumber} {lead.industry && `· ${lead.industry}`}
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline & Notes</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 max-w-2xl">
          <LeadOverviewForm
            id={lead.id}
            lead={{
              company: lead.company,
              industry: lead.industry ?? "",
              website: lead.website ?? "",
              location: lead.location ?? "",
              email: lead.email ?? "",
              phone: lead.phone ?? "",
              decisionMaker: lead.decisionMaker ?? "",
              priority: lead.priority,
              status: lead.status,
              leadScore: lead.leadScore != null ? String(lead.leadScore) : undefined,
              source: lead.source ?? "",
              tags: lead.tags,
              notes: lead.notes ?? "",
            }}
          />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <LeadPipelineTab leadId={lead.id} currentStage={lead.status} events={lead.pipelineEvents} />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditTab leadId={lead.id} audit={latestAudit} />
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailsTab leadId={lead.id} drafts={lead.emailDrafts} history={lead.emailHistory} followups={lead.followups} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsTab leadId={lead.id} attachments={lead.attachments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
