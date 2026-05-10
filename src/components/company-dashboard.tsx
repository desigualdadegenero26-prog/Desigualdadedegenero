import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Users, TrendingUp, Wallet, ClipboardList } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

type Company = {
  id: string;
  name: string;
  cnpj: string;
  sector: string;
  size: string;
  region: string;
};

type Entry = {
  id: string;
  gender: string;
  age: number;
  region: string;
  role: string;
  salary: number;
  created_at: string;
};

export function CompanyDashboard({ company }: { company: Company }) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("salary_entries")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });
    if (data) setEntries(data as Entry[]);
  };

  useEffect(() => {
    load();
  }, [company.id]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("salary_entries").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removido");
    load();
  };

  const total = entries.length;
  const avgF =
    entries.filter((e) => e.gender === "female").reduce((a, b) => a + Number(b.salary), 0) /
      Math.max(1, entries.filter((e) => e.gender === "female").length) || 0;
  const avgM =
    entries.filter((e) => e.gender === "male").reduce((a, b) => a + Number(b.salary), 0) /
      Math.max(1, entries.filter((e) => e.gender === "male").length) || 0;
  const gap = avgM > 0 ? ((avgM - avgF) / avgM) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border-2 border-primary bg-gradient-blue p-6 text-primary-foreground shadow-blue">
        <p className="text-xs uppercase tracking-wider text-gold">Painel privado</p>
        <h1 className="mt-1 text-3xl font-bold text-primary-foreground">{company.name}</h1>
        <p className="mt-1 text-sm opacity-90">
          {company.sector} · {company.size} funcionários · {company.region} · CNPJ {company.cnpj}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Registros enviados" value={total.toString()} />
        <StatCard
          icon={Wallet}
          label="Salário médio (M / F)"
          value={`R$ ${avgM.toFixed(0)} / R$ ${avgF.toFixed(0)}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Diferença salarial"
          value={`${gap.toFixed(1)}%`}
          highlight={gap > 0}
        />
      </div>

      <div className="rounded-xl border-2 border-gold bg-card p-6 shadow-gold">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-gold">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Enviar dados ao questionário</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione registros de funcionários para alimentar a pesquisa.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate({ to: "/questionario" })}
            className="bg-gradient-gold text-primary font-bold border-2 border-gold-deep shadow-gold hover:opacity-90"
          >
            Abrir questionário
          </Button>
        </div>
      </div>

      <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-blue">
        <h2 className="mb-4 border-b-2 border-gold pb-2 text-xl font-bold">
          Seus registros ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum registro ainda. Clique em "Abrir questionário" acima para começar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-primary">
                  <TableHead>Gênero</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {e.gender === "female" ? "Mulher" : "Homem"}
                    </TableCell>
                    <TableCell>{e.age}</TableCell>
                    <TableCell>{e.region}</TableCell>
                    <TableCell>{e.role}</TableCell>
                    <TableCell>
                      R$ {Number(e.salary).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(e.id)}
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border-2 border-primary bg-card p-5 shadow-blue">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-blue">
          <Icon className="h-5 w-5 text-gold" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold ${highlight ? "text-gold-deep" : "text-primary"}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
