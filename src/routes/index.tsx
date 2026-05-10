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
        <div className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[80px] select-none md:block lg:w-[110px]"
            style={{
              backgroundImage: `url(${borderFrame})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "auto 100%",
              backgroundPosition: "left center",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[80px] select-none md:block lg:w-[110px]"
            style={{
              backgroundImage: `url(${borderFrame})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "auto 100%",
              backgroundPosition: "right center",
              transform: "scaleX(-1)",
            }}
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
