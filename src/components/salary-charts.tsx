import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectorGapChart } from "./sector-gap-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Row = {
  gender: string;
  region: string;
  age_range: string;
  avg_salary: number;
  sample_size: number;
};

const AGE_ORDER = ["18-24", "25-34", "35-44", "45-54", "55+"];
const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

const COLORS_M = ["#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];
const COLORS_F = ["#b45309", "#d97706", "#f59e0b", "#fbbf24", "#fcd34d"];

function buildSeries(rows: Row[], gender: "male" | "female") {
  const filtered = rows.filter((r) => r.gender === gender);
  return AGE_ORDER.map((age) => {
    const entry: Record<string, string | number> = { age };
    REGIONS.forEach((region) => {
      const match = filtered.find((r) => r.age_range === age && r.region === region);
      entry[region] = match ? Number(match.avg_salary) : 0;
    });
    return entry;
  });
}

function ChartCard({
  title,
  subtitle,
  data,
  colors,
}: {
  title: string;
  subtitle: string;
  data: Record<string, string | number>[];
  colors: string[];
}) {
  const isEmpty = data.every((d) => REGIONS.every((r) => !d[r]));
  return (
    <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-blue">
      <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-gold pb-3">
        <div>
          <h3 className="text-xl font-bold text-primary">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className="rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold text-primary">
          R$ / mês
        </span>
      </div>

      {isEmpty ? (
        <div className="flex h-72 items-center justify-center text-center text-sm text-muted-foreground">
          Aguardando dados das empresas. Cadastre sua empresa e contribua!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 250)" />
            <XAxis dataKey="age" tick={{ fill: "oklch(0.32 0.18 265)", fontSize: 12 }} />
            <YAxis tick={{ fill: "oklch(0.32 0.18 265)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "2px solid oklch(0.36 0.18 265)",
                borderRadius: 8,
              }}
              formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {REGIONS.map((r, i) => (
              <Bar key={r} dataKey={r} fill={colors[i]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function SalaryCharts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase.from("salary_aggregates").select("*");
      if (!mounted) return;
      if (!error && data) setRows(data as Row[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("salary-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "salary_entries" }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const maleData = buildSeries(rows, "male");
  const femaleData = buildSeries(rows, "female");
  const totalSamples = rows.reduce((acc, r) => acc + Number(r.sample_size || 0), 0);

  return (
    <section id="graficos" className="border-y-2 border-primary bg-secondary/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full border-2 border-gold bg-card px-4 py-1 text-xs font-bold uppercase tracking-wider text-gold-deep">
            Dados agregados em tempo real
          </span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            A diferença salarial em <span className="text-gold">números</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Salário médio por faixa etária e região, separado por gênero. Dados enviados voluntariamente
            por empresas cadastradas.{" "}
            <strong className="text-primary">{loading ? "..." : totalSamples}</strong> registros
            anônimos somados.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectorGapChart gender="male" />
          <SectorGapChart gender="female" />
        </div>
      </div>
    </section>
  );
}
