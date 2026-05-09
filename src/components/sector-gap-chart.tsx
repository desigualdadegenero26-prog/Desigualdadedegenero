import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

type Gender = "male" | "female";

const SECTORS = ["Total", "Indústria", "Agropecuária", "Construção", "Serviços", "Comércio"];

// Dados ilustrativos baseados na imagem de referência (gap salarial em %)
const DATA: Record<Gender, { sector: string; y2023: number; y2025: number }[]> = {
  female: [
    { sector: "Total", y2023: -13.7, y2025: -14.3 },
    { sector: "Indústria", y2023: -11.4, y2025: -13.7 },
    { sector: "Agropecuária", y2023: -11.9, y2025: -13.6 },
    { sector: "Construção", y2023: -12.1, y2025: -13.1 },
    { sector: "Serviços", y2023: -1.7, y2025: -2.2 },
    { sector: "Comércio", y2023: -3.4, y2025: -4.1 },
  ],
  male: [
    { sector: "Total", y2023: 0, y2025: 0 },
    { sector: "Indústria", y2023: 0.4, y2025: 0.6 },
    { sector: "Agropecuária", y2023: 0.3, y2025: 0.5 },
    { sector: "Construção", y2023: 0.2, y2025: 0.4 },
    { sector: "Serviços", y2023: 0.1, y2025: 0.3 },
    { sector: "Comércio", y2023: 0.2, y2025: 0.4 },
  ],
};

const COLORS: Record<Gender, { c2023: string; c2025: string }> = {
  male: { c2023: "#93c5fd", c2025: "#1e3a8a" },
  female: { c2023: "#fbcfe8", c2025: "#be123c" },
};

export function SectorGapChart({ gender }: { gender: Gender }) {
  const data = DATA[gender];
  const colors = COLORS[gender];
  const label = gender === "male" ? "Homens" : "Mulheres";

  return (
    <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-blue">
      <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-gold pb-3">
        <div>
          <h3 className="text-xl font-bold text-primary">
            Gap de contratação — {label}
          </h3>
          <p className="text-sm text-muted-foreground">
            Comparativo por setor (2023 vs 2025)
          </p>
        </div>
        <span className="rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold text-primary">
          Em %
        </span>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 250)" />
          <XAxis
            dataKey="sector"
            tick={{ fill: "oklch(0.32 0.18 265)", fontSize: 11 }}
            interval={0}
          />
          <YAxis tick={{ fill: "oklch(0.32 0.18 265)", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "2px solid oklch(0.36 0.18 265)",
              borderRadius: 8,
            }}
            formatter={(v: number) => `${v.toLocaleString("pt-BR")}%`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="y2023" name="2023" fill={colors.c2023} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="y2023"
              position="top"
              style={{ fill: "oklch(0.32 0.18 265)", fontSize: 11 }}
              formatter={(v: number) => `${v}`}
            />
          </Bar>
          <Bar dataKey="y2025" name="2025" fill={colors.c2025} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="y2025"
              position="top"
              style={{ fill: colors.c2025, fontSize: 11, fontWeight: 700 }}
              formatter={(v: number) => `${v}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
