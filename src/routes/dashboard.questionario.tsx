import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { OpinionSurveyForm } from "@/components/opinion-survey-form";
import { AuthModal } from "@/components/auth-modal";

export const Route = createFileRoute("/dashboard/questionario")({
  component: QuestionnairePage,
});

function QuestionnairePage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader onOpenLogin={() => setAuthOpen(true)} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <OpinionSurveyForm />
      </main>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
