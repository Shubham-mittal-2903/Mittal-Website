import SubjectForm from "@/components/leads/SubjectForm";

export default function NewSubjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New Subject</h1>
      <SubjectForm />
    </div>
  );
}
