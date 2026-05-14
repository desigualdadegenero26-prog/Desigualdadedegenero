import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { SalaryCharts } from "@/components/salary-charts";
import { AboutSection } from "@/components/about-section";
import { AuthModal } from "@/components/auth-modal";
import borderLeft from "@/assets/border-left.png";
import borderRight from "@/assets/border-right.png";



export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-16 bg-repeat-y md:block lg:w-20"
        style={{ backgroundImage: `url(${borderLeft})`, backgroundSize: "100% auto" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 right-0 z-40 hidden w-16 bg-repeat-y md:block lg:w-20"
        style={{ backgroundImage: `url(${borderRight})`, backgroundSize: "100% auto" }}
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
