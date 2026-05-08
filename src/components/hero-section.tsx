import { Button } from "@/components/ui/button";

interface Props {
  onJoin: () => void;
}

export function HeroSection({ onJoin }: Props) {
  return (
    <section className="relative overflow-hidden border-b-2 border-primary bg-secondary/30">
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center">
        <span className="inline-block rounded-full border-2 border-primary bg-card px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          Transparência salarial
        </span>
        <h1
          className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl"
          style={{ textShadow: "2px 2px 4px hsl(0 0% 80% / 0.8)" }}
        >
          <span style={{ color: "var(--blue-deep)" }}>Desigualdade salarial de</span>{" "}
          <span className="text-gold">gêneros</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-foreground/80">
          A EquiSalário reúne dados anônimos de empresas brasileiras para revelar a diferença real entre
          salários de homens e mulheres por idade e região.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={onJoin}
            className="bg-gradient-gold text-primary font-bold border-2 border-gold-deep shadow-gold hover:opacity-90"
          >
            Sua empresa quer participar?
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-2 border-primary bg-card text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <a href="#graficos">Ver os dados</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
