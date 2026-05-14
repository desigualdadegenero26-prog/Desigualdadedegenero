import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { SalaryCharts } from "@/components/salary-charts";
import { AboutSection } from "@/components/about-section";
import { AuthModal } from "@/components/auth-modal";
import { DecorativeFrame } from "@/components/decorative-frame";



export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader onOpenLogin={() => setAuthOpen(true)} />
      <main className="space-y-10 px-4 py-10 md:px-8">
        <DecorativeFrame className="p-6 md:p-10">
          <HeroSection onJoin={() => setAuthOpen(true)} />
        </DecorativeFrame>
        <DecorativeFrame className="p-6 md:p-10">
          <SalaryCharts />
        </DecorativeFrame>
        <DecorativeFrame className="p-6 md:p-10">
          <AboutSection />
        </DecorativeFrame>
      </main>
      <footer className="border-t-2 border-primary bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>
            <span className="font-bold text-primary">EquiSalário</span> · Dados agregados de empresas
            participantes · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
