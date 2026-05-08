import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { SalaryCharts } from "@/components/salary-charts";
import { AboutSection } from "@/components/about-section";
import { AuthModal } from "@/components/auth-modal";
import borderFrame from "@/assets/border-frame.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <img
        src={borderFrame}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 h-screen w-12 object-cover object-left md:w-20"
      />
      <img
        src={borderFrame}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed right-0 top-0 z-50 h-screen w-12 -scale-x-100 object-cover object-left md:w-20"
      />
      <SiteHeader onOpenLogin={() => setAuthOpen(true)} />
      <main>
        <HeroSection onJoin={() => setAuthOpen(true)} />
        <SalaryCharts />
        <AboutSection />
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
