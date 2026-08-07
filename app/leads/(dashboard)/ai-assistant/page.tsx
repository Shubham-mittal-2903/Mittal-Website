import JaydenChat from "@/components/leads/JaydenChat";

export default function AiAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Jayden</h1>
        <p className="text-sm text-muted-foreground">Your AI, grounded in your live MITTAL OS data — nothing invented.</p>
      </div>
      <JaydenChat />
    </div>
  );
}
