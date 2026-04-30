import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { AuthModal } from "@/components/auth-modal";

export const Route = createFileRoute("/dashboard/questionario")({
  component: QuestionnairePage,
});

type Company = {
  id: string;
  name: string;
  region: string;
};

function QuestionnairePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [checking, setChecking] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setAuthOpen(true);
      setChecking(false);
      return;
    }
    let alive = true;
    supabase
      .from("companies")
      .select("id, name, region")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        if (!data) {
          navigate({ to: "/dashboard" });
          return;
        }
        setCompany(data as Company);
        setChecking(false);
      });
    return () => {
      alive = false;
    };
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader onOpenLogin={() => setAuthOpen(true)} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {loading || checking ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Carregando...
          </div>
        ) : !user ? (
          <div className="rounded-xl border-2 border-primary bg-card p-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">Acesso restrito</h2>
            <p className="text-muted-foreground">Faça login para enviar dados.</p>
          </div>
        ) : company ? (
          <QuestionnaireForm company={company} />
        ) : null}
      </main>
      <AuthModal
        open={authOpen}
        onOpenChange={(v) => {
          setAuthOpen(v);
          if (!v && !user) navigate({ to: "/" });
        }}
      />
    </div>
  );
}
