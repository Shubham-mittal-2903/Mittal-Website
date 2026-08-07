import AiAssistantChat from "@/components/leads/AiAssistantChat";

export default function AiAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">Grounded in your live MITTAL OS data — nothing invented.</p>
      </div>
      <AiAssistantChat />
    </div>
  );
}
