import { Users, ShieldCheck, TrendingUp } from "lucide-react";

const items = [
  {
    icon: Users,
    title: "Dados de empresas reais",
    text: "Cada empresa cadastrada envia seus próprios registros de pesquisa salarial.",
  },
  {
    icon: ShieldCheck,
    title: "100% anônimo no público",
    text: "Apenas médias agregadas por gênero, idade e região aparecem nos gráficos públicos.",
  },
  {
    icon: TrendingUp,
    title: "Painel privado",
    text: "Cada empresa enxerga apenas seus próprios dados em um painel exclusivo.",
  },
];

export function AboutSection() {
  return (
    <section id="sobre" className="bg-card py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Como <span className="text-gold">funciona</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border-2 border-primary bg-secondary/30 p-6 transition-shadow hover:shadow-blue"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-blue shadow-gold">
                <Icon className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
