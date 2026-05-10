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
      <SiteHeader onOpenLogin={() => setAuthOpen(true)} />
      <main>
        <div className="relative">
          <img
            src={borderFrame}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 select-none md:block"
            style={{ width: "90px", height: "auto", opacity: 0.9 }}
          />
          <img
            src={borderFrame}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 scale-x-[-1] select-none md:block"
            style={{ width: "90px", height: "auto", opacity: 0.9 }}
          />
          <HeroSection onJoin={() => setAuthOpen(true)} />
        </div>
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
