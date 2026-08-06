import { db } from "@/lib/db";
import NewProjectForm from "@/components/leads/NewProjectForm";

export default async function NewProjectPage() {
  const clients = await db.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New Project</h1>
      <NewProjectForm clients={clients} />
    </div>
  );
}
