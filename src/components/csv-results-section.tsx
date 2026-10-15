import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { RefreshCw, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { getCsvStats, downloadMyCsv, importCsv, type CsvStats } from "@/lib/csv-questionario.functions";

const BLUE = "var(--primary)";
const GOLD = "var(--gold)";
const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-primary bg-card p-5 shadow-blue">
      <h3 className="mb-3 border-b-2 border-gold pb-2 text-lg font-bold text-primary">{title}</h3>
      {children}
    </div>
  );
}

export function CsvResultsSection() {
  const { user } = useAuth();
  const fetchStats = useServerFn(getCsvStats);
  const fetchCsv = useServerFn(downloadMyCsv);
  const sendImport = useServerFn(importCsv);
  const [stats, setStats] = useState<CsvStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await fetchStats());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao ler os dados");
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    load();
    const onUpd = () => load();
    window.addEventListener("csv-updated", onUpd);
    const t = setInterval(load, 30000);
    return () => {
      window.removeEventListener("csv-updated", onUpd);
      clearInterval(t);
    };
  }, [load]);

  const handleDownload = async () => {
    try {
      const { csv } = await fetchCsv();
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "respostas_questionario.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao baixar o arquivo");
    }
  };

  const handleImport = async (file: File) => {
    try {
      const { data: company } = await supabase.from("companies").select("id").maybeSingle();
      if (!company) return toast.error("Cadastre sua empresa antes de importar.");
      const res = await sendImport({ data: { company_id: company.id, csv: await file.text() } });
      toast.success(`${res.added} linha(s) importada(s). ${res.skipped} repetida(s), ${res.invalid} inválida(s).`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao importar o arquivo");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const m = stats?.byGender[0];
  const f = stats?.byGender[1];

  return (
    <section id="resultados" className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full border-2 border-gold bg-card px-4 py-1 text-xs font-bold uppercase tracking-wider text-gold-deep">
            Resultados do questionário salarial
          </span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Respostas <span className="text-gold">reais</span> das empresas
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Calculado a partir do arquivo de respostas. Apenas totais e médias são exibidos.
            {stats?.updatedAt && <> Última atualização: {new Date(stats.updatedAt).toLocaleString("pt-BR")}.</>}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={load} disabled={loading} className="border-2 border-primary text-primary">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            {user && (
              <>
                <Button onClick={handleDownload} className="bg-gradient-gold text-primary font-bold border-2 border-gold-deep">
                  <Download className="mr-2 h-4 w-4" /> Baixar CSV da minha empresa
                </Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()} className="border-2 border-gold text-primary">
                  <Upload className="mr-2 h-4 w-4" /> Importar CSV
                </Button>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden
                  onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])} />
              </>
            )}
          </div>
        </div>

        {error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : !stats ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : stats.total === 0 ? (
          <p className="rounded-xl border-2 border-primary bg-card p-10 text-center text-muted-foreground">
            Nenhuma resposta registrada até o momento
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Questionários registrados", String(stats.total)],
                ["Salário médio — homens", brl(m!.avgSalary)],
                ["Salário médio — mulheres", brl(f!.avgSalary)],
                ["Diferença salarial", stats.gapPercent === null ? "—" : `${stats.gapPercent.toFixed(1)}%`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border-2 border-gold bg-card p-4 text-center">
                  <p className="text-xs uppercase text-muted-foreground">{k}</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{v}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Respostas por gênero">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={stats.byGender} dataKey="count" nameKey="label" outerRadius={95}
                      label={(d: { label: string; percent: number; count: number }) => `${d.label}: ${d.count}`}>
                      <Cell fill={BLUE} />
                      <Cell fill={GOLD} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <table className="mt-2 w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground"><th>Gênero</th><th>Qtd.</th><th>%</th><th>Idade média</th><th>Horas/sem.</th></tr></thead>
                  <tbody>
                    {stats.byGender.map((g) => (
                      <tr key={g.label} className="border-t">
                        <td className="font-semibold text-primary">{g.label}</td>
                        <td>{g.count}</td>
                        <td>{g.percent.toFixed(1)}%</td>
                        <td>{g.avgAge.toFixed(1)}</td>
                        <td>{g.avgHours.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card title="Salário médio por faixa etária">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.byAge}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => brl(v)} />
                    <Legend />
                    <Bar dataKey="Homem" fill={BLUE} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Mulher" fill={GOLD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Salário médio por região">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.byRegion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => brl(v)} />
                    <Legend />
                    <Bar dataKey="Homem" fill={BLUE} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Mulher" fill={GOLD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Cargos de liderança (% de cada gênero)">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.leadership}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Bar dataKey="Homem" fill={BLUE} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Mulher" fill={GOLD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
